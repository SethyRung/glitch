import type { H3Event } from "h3";
import { eq, and, gt, isNull } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { refreshTokens, users } from "hub:db:schema";

export async function refreshToken(event: H3Event) {
  const config = useRuntimeConfig();
  const refreshToken = getCookie(event, CookieName.RefreshToken);

  if (!refreshToken) {
    return createResponse(
      { code: ApiResponseCode.Unauthorized, message: "No refresh token" },
      null,
    );
  }

  try {
    const payload = verifyToken(refreshToken, config.jwt.refresh);

    if (!payload) {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "Invalid or expired refresh token" },
        null,
      );
    }

    const storedToken = await db.query.refreshTokens.findFirst({
      where: and(
        eq(refreshTokens.token, refreshToken),
        gt(refreshTokens.expiresAt, new Date()),
        isNull(refreshTokens.revokedAt),
      ),
    });

    if (!storedToken) {
      return createResponse(
        { code: ApiResponseCode.NotFound, message: "Refresh token not found or revoked" },
        null,
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    if (!user) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "User not found" }, null);
    }

    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, storedToken.id));

    const newAccessToken = generateTokens(
      { userId: user.id, email: user.email, name: user.name },
      config.jwt.access,
    );
    const newRefreshToken = generateTokens(
      { userId: user.id, type: "refresh" },
      config.jwt.refresh,
    );

    await db.insert(refreshTokens).values({
      token: newRefreshToken,
      userId: user.id,
      expiresAt: expiresInToDate(config.jwt.refresh.expiresIn),
    });

    const isProduction = process.env.NODE_ENV === "production";

    setCookie(event, CookieName.AccessToken, newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: expiresInToSeconds(config.jwt.access.expiresIn),
    });

    setCookie(event, CookieName.RefreshToken, newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: expiresInToSeconds(config.jwt.refresh.expiresIn),
    });

    return createResponse(
      { code: ApiResponseCode.Success, message: "Token refreshed successfully" },
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          balance: user.balance,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    );
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to refresh token" },
      null,
    );
  }
}
