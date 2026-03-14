import { eq, and, gt, isNull } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { refreshTokens, users } from "hub:db:schema";
import type { ResponseCode } from "#shared/types";
import { createResponse } from "#server/utils/response";
import {
  generateAccessToken,
  generateRefreshToken,
  calculateRefreshTokenExpiry,
  verifyRefreshToken,
} from "#server/utils/auth";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body?.refreshToken) {
      return createResponse(
        { code: "ValidationError" as ResponseCode, message: "Refresh token is required" },
        null,
      );
    }

    const config = useRuntimeConfig();
    const payload = verifyRefreshToken(body.refreshToken, config.jwt.refresh);

    if (!payload) {
      return createResponse(
        { code: "Unauthorized" as ResponseCode, message: "Invalid or expired refresh token" },
        null,
      );
    }

    const storedToken = await db.query.refreshTokens.findFirst({
      where: and(
        eq(refreshTokens.token, body.refreshToken),
        gt(refreshTokens.expiresAt, new Date()),
        isNull(refreshTokens.revokedAt),
      ),
    });

    if (!storedToken) {
      return createResponse(
        { code: "Unauthorized" as ResponseCode, message: "Refresh token not found or revoked" },
        null,
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    if (!user) {
      return createResponse({ code: "NotFound" as ResponseCode, message: "User not found" }, null);
    }

    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, storedToken.id));

    const newAccessToken = generateAccessToken(
      { id: user.id, email: user.email, name: user.name },
      config.jwt.access,
    );
    const newRefreshToken = generateRefreshToken(user.id, config.jwt.refresh);
    const newRefreshTokenExpiry = calculateRefreshTokenExpiry(config.jwt.refresh.expiresIn);

    await db.insert(refreshTokens).values({
      token: newRefreshToken,
      userId: user.id,
      expiresAt: newRefreshTokenExpiry,
    });

    return createResponse(
      { code: "Success" as ResponseCode, message: "Token refreshed successfully" },
      { accessToken: newAccessToken, refreshToken: newRefreshToken },
    );
  } catch (error) {
    console.error("Refresh token error:", error);
    return createResponse(
      { code: "InternalError" as ResponseCode, message: "An error occurred during token refresh" },
      null,
    );
  }
});
