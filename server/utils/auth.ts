import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface Payload {
  userId: string;
  [key: string]: any;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateTokens<T extends Payload>(
  payload: T,
  config: { secret: string; expiresIn: string },
) {
  return jwt.sign(payload, config.secret, {
    expiresIn: config.expiresIn as Parameters<typeof jwt.sign>[2]["expiresIn"],
  });
}

export function verifyToken<T extends Payload>(token: string, config: { secret: string }) {
  try {
    return jwt.verify(token, config.secret) as T;
  } catch {
    return null;
  }
}

/**
 *
 * Convert an expiresIn string like `15m`, `1h`, `7d`, `30s` into a Date object for token expiry.
 */
export function expiresInToDate(expiresIn: string): Date {
  const now = new Date();
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) {
    throw new Error(`Invalid expiresIn format: ${expiresIn}`);
  }

  const value = Number.parseInt(match[1]!, 10);
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

/**
 * Convert an expiresIn string like `15m`, `1h`, `7d`, `30s` into seconds for cookie maxAge.
 */
export function expiresInToSeconds(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) {
    throw new Error(`Invalid expiresIn format: ${expiresIn}`);
  }

  const [, valueStr, unit] = match;
  if (!valueStr || !unit) {
    throw new Error(`Invalid expiresIn format: ${expiresIn}`);
  }

  const value = Number.parseInt(valueStr, 10);

  const unitMultipliers: Record<string, number> = {
    d: 86400,
    h: 3600,
    m: 60,
    s: 1,
  };

  const multiplier = unitMultipliers[unit];
  if (!multiplier) {
    throw new Error(`Invalid expiresIn unit: ${unit}`);
  }

  return value * multiplier;
}
