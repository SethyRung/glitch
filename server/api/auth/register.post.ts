import { eq } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { refreshTokens, users } from "hub:db:schema";
import type { ResponseCode } from "#shared/types";
import { createResponse } from "#server/utils/response";
import {
  generateAccessToken,
  generateRefreshToken,
  calculateRefreshTokenExpiry,
  hashPassword,
} from "#server/utils/auth";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body?.email || !body?.password || !body?.name) {
      return createResponse(
        {
          code: "ValidationError" as ResponseCode,
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
        { code: "ValidationError" as ResponseCode, message: "Email already registered" },
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
        { code: "InternalError" as ResponseCode, message: "Failed to create user" },
        null,
      );
    }

    const config = useRuntimeConfig();
    const accessToken = generateAccessToken(
      {
        id: newUser[0]!.id,
        email: newUser[0]!.email,
        name: newUser[0]!.name,
        balance: newUser[0]!.balance.toString(),
      },
      config.jwt.access,
    );
    const refreshToken = generateRefreshToken(newUser[0]!.id, config.jwt.refresh);
    const refreshTokenExpiry = calculateRefreshTokenExpiry(config.jwt.refresh.expiresIn);

    await db.insert(refreshTokens).values({
      token: refreshToken,
      userId: newUser[0]!.id,
      expiresAt: refreshTokenExpiry,
    });

    return createResponse(
      { code: "Success" as ResponseCode, message: "Registration successful" },
      {
        accessToken,
        refreshToken,
        user: { id: newUser[0]!.id, name: newUser[0]!.name, email: newUser[0]!.email },
      },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return createResponse(
      { code: "InternalError" as ResponseCode, message: "An error occurred during registration" },
      null,
    );
  }
});
