import { eq, and, isNull } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { refreshTokens } from "hub:db:schema";

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const cookieRefresh = getCookie(event, CookieName.RefreshToken);

    const payload = verifyToken(cookieRefresh ?? "", config.jwt.refresh);

    if (!payload) {
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "User not authenticated" },
        null,
      );
    }

    const { userId } = payload;

    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));

    deleteCookie(event, CookieName.AccessToken);
    deleteCookie(event, CookieName.RefreshToken);

    return createResponse({ code: ApiResponseCode.Success, message: "Logout successful" }, null);
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "An error occurred during logout" },
      null,
    );
  }
});
