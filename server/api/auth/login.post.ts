import { eq } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { refreshTokens, users } from "hub:db:schema";
import type { ResponseCode } from "#shared/types";
import { createResponse } from "#server/utils/response";
import {
  generateAccessToken,
  generateRefreshToken,
  calculateRefreshTokenExpiry,
  verifyPassword,
} from "#server/utils/auth";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body?.email || !body?.password) {
      return createResponse(
        { code: "ValidationError" as ResponseCode, message: "Email and password are required" },
        null,
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, body.email),
    });

    if (!user) {
      return createResponse(
        { code: "Unauthorized" as ResponseCode, message: "Invalid email or password" },
        null,
      );
    }

    const isValidPassword = await verifyPassword(body.password, user.passwordHash);

    if (!isValidPassword) {
      return createResponse(
        { code: "Unauthorized" as ResponseCode, message: "Invalid email or password" },
        null,
      );
    }

    const config = useRuntimeConfig();
    const accessToken = generateAccessToken(
      { id: user.id, email: user.email, name: user.name, balance: user.balance.toString() },
      config.jwt.access,
    );
    const refreshToken = generateRefreshToken(user.id, config.jwt.refresh);
    const refreshTokenExpiry = calculateRefreshTokenExpiry(config.jwt.refresh.expiresIn);

    await db.insert(refreshTokens).values({
      token: refreshToken,
      userId: user.id,
      expiresAt: refreshTokenExpiry,
    });

    return createResponse(
      { code: "Success" as ResponseCode, message: "Login successful" },
      { accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email } },
    );
  } catch (error) {
    console.error("Login error:", error);
    return createResponse(
      { code: "InternalError" as ResponseCode, message: "An error occurred during login" },
      null,
    );
  }
});
