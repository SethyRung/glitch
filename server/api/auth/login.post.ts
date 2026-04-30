import { eq } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { refreshTokens, users } from "hub:db:schema";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body?.email || !body?.password) {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "Email and password are required" },
        null,
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, body.email),
    });

    if (!user) {
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "Invalid email or password" },
        null,
      );
    }

    const isValidPassword = await verifyPassword(body.password, user.passwordHash);

    if (!isValidPassword) {
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "Invalid email or password" },
        null,
      );
    }

    const config = useRuntimeConfig();

    const accessToken = generateTokens(
      { userId: user.id, email: user.email, name: user.name },
      config.jwt.access,
    );

    const refreshToken = generateTokens({ userId: user.id, type: "refresh" }, config.jwt.refresh);

    await db.insert(refreshTokens).values({
      userId: user.id,
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
      { code: ApiResponseCode.Success, message: "Login successful" },
      {
        id: user.id,
        email: user.email,
        name: user.name,
        balance: user.balance,
      },
    );
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "An error occurred during login" },
      null,
    );
  }
});
