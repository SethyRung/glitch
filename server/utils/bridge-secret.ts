import { createHash, timingSafeEqual } from "node:crypto";

export function computeBridgeHash(userId: string, email: string): string {
  const { bridgeSharedSecret: secret } = useRuntimeConfig();
  if (!secret) throw new Error("NUXT_BRIDGE_SHARED_SECRET is not configured");
  return createHash("sha256").update(`${userId}${email}${secret}`).digest("hex");
}

export function verifyBridgeHash(userId: string, email: string, candidate: string): boolean {
  const expected = computeBridgeHash(userId, email);
  // Compare bytes, not hex strings — string length can leak via early-return.
  const expBuf = Buffer.from(expected, "hex");
  const candBuf = Buffer.from(candidate, "hex");
  if (expBuf.length !== candBuf.length) return false;
  return timingSafeEqual(expBuf, candBuf);
}
