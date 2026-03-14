import { eq, and, isNull } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { refreshTokens } from "hub:db:schema";
import type { ResponseCode } from "#shared/types";
import { createResponse } from "#server/utils/response";
import { verifyAccessToken } from "#server/utils/auth";

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.user?.userId;

    if (!userId) {
      return createResponse(
        { code: "Unauthorized" as ResponseCode, message: "User not authenticated" },
        null,
      );
    }

    const authHeader = getHeader(event, "authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return createResponse(
        { code: "Unauthorized" as ResponseCode, message: "Access token not provided" },
        null,
      );
    }

    const config = useRuntimeConfig();
    const payload = verifyAccessToken(token, config.jwt.access);

    if (!payload || payload.userId !== userId) {
      return createResponse(
        { code: "Unauthorized" as ResponseCode, message: "Invalid access token" },
        null,
      );
    }

    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));

    return createResponse({ code: "Success" as ResponseCode, message: "Logout successful" }, null);
  } catch (error) {
    console.error("Logout error:", error);
    return createResponse(
      { code: "InternalError" as ResponseCode, message: "An error occurred during logout" },
      null,
    );
  }
});
