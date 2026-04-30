import { eq } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { users } from "hub:db:schema";

export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, CookieName.AccessToken);

    if (!token) {
      return createResponse({ code: ApiResponseCode.Success, message: "Not authenticated" }, false);
    }

    const config = useRuntimeConfig();
    const payload = verifyToken<AccessTokenPayload>(token, config.jwt.access);

    if (!payload) {
      return createResponse(
        { code: ApiResponseCode.Success, message: "Invalid or expired token" },
        false,
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
      columns: { id: true, email: true, name: true, balance: true },
    });

    if (!user) {
      return createResponse({ code: ApiResponseCode.Success, message: "User not found" }, false);
    }

    return createResponse({ code: ApiResponseCode.Success, message: "Authenticated" }, true);
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "An error occurred" },
      null,
    );
  }
});
