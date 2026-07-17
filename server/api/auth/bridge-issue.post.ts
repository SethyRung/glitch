import { eq } from "drizzle-orm";
import { readBody } from "h3";
import { db } from "@nuxthub/db";
import { user } from "hub:db:schema";

const ISSUER = "easypay";

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

async function ensureBridgeUser(userId: string, email: string) {
  const existing = await db.select().from(user).where(eq(user.nativeUserId, userId)).limit(1);
  if (existing[0]) {
    return existing[0];
  }

  const inserted = await db
    .insert(user)
    .values({
      id: newId(),
      email,
      name: email.split("@")[0] ?? email,
      nativeUserId: userId,
      bridgeLinkedAt: new Date().toISOString(),
      bridgeIssuer: ISSUER,
    })
    .onConflictDoNothing({ target: user.nativeUserId })
    .returning();
  if (inserted[0]) {
    return inserted[0];
  }

  const raced = await db.select().from(user).where(eq(user.nativeUserId, userId)).limit(1);

  return raced[0] ?? null;
}

export default defineEventHandler(async (event) => {
  const raw = await readBody(event);

  if (raw === null || typeof raw !== "object") {
    return createResponse({
      code: ApiResponseCode.InvalidRequest,
      message: "request body required",
    });
  }
  const body = raw as Record<string, unknown>;
  if (
    typeof body.userId !== "string" ||
    typeof body.email !== "string" ||
    typeof body.hash !== "string"
  ) {
    return createResponse({
      code: ApiResponseCode.InvalidRequest,
      message: "userId, email, and hash are required",
    });
  }

  if (!verifyBridgeHash(body.userId, body.email, body.hash)) {
    return createResponse({
      code: ApiResponseCode.InvalidRequest,
      message: "hash mismatch",
    });
  }

  const row = await ensureBridgeUser(body.userId, body.email);
  if (!row) {
    return createResponse({
      code: ApiResponseCode.InternalError,
      message: "user upsert failed",
    });
  }

  const session = await createSession(event, row.id);

  await setSessionCookie(event, session.token);

  return createResponse({ code: ApiResponseCode.Success }, null);
});
