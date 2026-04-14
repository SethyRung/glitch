import { eq } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { refreshTokens, users } from "hub:db:schema";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body?.email || !body?.password || !body?.name) {
      return createResponse(
        {
          code: ApiResponseCode.ValidationError,
          message: "Email, password, and name are required",
        },
        null,
      );
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, body.email),
    });

    if (existingUser) {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "Email already registered" },
        null,
      );
    }

    const passwordHash = await hashPassword(body.password);

    const newUser = await db
      .insert(users)
      .values({
        email: body.email,
        passwordHash,
        name: body.name,
        balance: "0",
      })
      .returning();

    if (!newUser || newUser.length === 0) {
      return createResponse(
        { code: ApiResponseCode.InternalError, message: "Failed to create user" },
        null,
      );
    }

    const config = useRuntimeConfig();

    const accessToken = generateTokens(
      { userId: newUser[0]!.id, email: newUser[0]!.email, name: newUser[0]!.name },
      config.jwt.access,
    );

    const refreshToken = generateTokens(
      { userId: newUser[0]!.id, type: "refresh" },
      config.jwt.refresh,
    );

    await db.insert(refreshTokens).values({
      userId: newUser[0]!.id,
      token: refreshToken,
      expiresAt: expiresInToDate(config.jwt.refresh.expiresIn),
    });

    const isProduction = process.env.NODE_ENV === "production";

    setCookie(event, CookieName.AccessToken, accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: expiresInToSeconds(config.jwt.access.expiresIn),
    });

    setCookie(event, CookieName.RefreshToken, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: expiresInToSeconds(config.jwt.refresh.expiresIn),
    });

    return createResponse(
      { code: ApiResponseCode.Success, message: "Registration successful" },
      {
        user: {
          id: newUser[0]!.id,
          email: newUser[0]!.email,
          name: newUser[0]!.name,
          balance: newUser[0]!.balance,
          createdAt: newUser[0]!.createdAt,
          updatedAt: newUser[0]!.updatedAt,
        },
      },
    );
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "An error occurred during registration" },
      null,
    );
  }
});
