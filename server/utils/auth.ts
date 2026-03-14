import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { User } from "#shared/types";

export interface AccessTokenPayload {
  userId: string;
  email: string;
  name: string;
}

export interface RefreshTokenPayload {
  userId: string;
  type: "refresh";
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateAccessToken(
  user: Omit<User, "passwordHash" | "createdAt" | "updatedAt">,
  config: { secret: string; expiresIn: string },
): string {
  const payload: AccessTokenPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
  };

  return jwt.sign(payload, config.secret, {
    expiresIn: config.expiresIn as Parameters<typeof jwt.sign>[2]["expiresIn"],
  });
}

export function generateRefreshToken(
  userId: string,
  config: { secret: string; expiresIn: string },
): string {
  const payload: RefreshTokenPayload = {
    userId,
    type: "refresh",
  };

  return jwt.sign(payload, config.secret, {
    expiresIn: config.expiresIn as Parameters<typeof jwt.sign>[2]["expiresIn"],
  });
}

export function verifyAccessToken(
  token: string,
  config: { secret: string },
): AccessTokenPayload | null {
  try {
    return jwt.verify(token, config.secret) as AccessTokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(
  token: string,
  config: { secret: string },
): RefreshTokenPayload | null {
  try {
    const payload = jwt.verify(token, config.secret) as RefreshTokenPayload;
    if (payload.type !== "refresh") {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function calculateRefreshTokenExpiry(expiresIn: string): Date {
  const now = new Date();
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) {
    throw new Error(`Invalid expiresIn format: ${expiresIn}`);
  }

  const value = Number.parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "d":
      return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
    case "h":
      return new Date(now.getTime() + value * 60 * 60 * 1000);
    case "m":
      return new Date(now.getTime() + value * 60 * 1000);
    case "s":
      return new Date(now.getTime() + value * 1000);
    default:
      throw new Error(`Invalid expiresIn unit: ${unit}`);
  }
}
