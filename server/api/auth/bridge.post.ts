import { eq } from "drizzle-orm";
import { readBody } from "h3";
import { db } from "@nuxthub/db";
import { user } from "hub:db:schema";

const ISSUER = "easypay";

interface BridgeRequestBody {
  userId: string;
  email: string;
  hash: string;
  mode?: "login" | "register";
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export default defineEventHandler(
  async (event): Promise<ApiResponse<{ mode: "login" | "register" }>> => {
    const raw = await readBody(event).catch(() => null);
    if (raw === null || typeof raw !== "object") {
      return createResponse({
        code: ApiResponseCode.InvalidRequest,
        message: "request body required",
      });
    }
    const r = raw as Record<string, unknown>;
    if (typeof r.userId !== "string" || typeof r.email !== "string" || typeof r.hash !== "string") {
      return createResponse({
        code: ApiResponseCode.InvalidRequest,
        message: "userId, email, and hash are required",
      });
    }
    const body: BridgeRequestBody = {
      userId: r.userId,
      email: r.email,
      hash: r.hash,
    };
    if (r.mode === "login" || r.mode === "register") body.mode = r.mode;

    if (!verifyBridgeHash(body.userId, body.email, body.hash)) {
      console.warn("[bridge] hash mismatch", { userId: body.userId });
      return createResponse({
        code: ApiResponseCode.InvalidRequest,
        message: "hash mismatch",
      });
    }

    const existing = await db
      .select()
      .from(user)
      .where(eq(user.nativeUserId, body.userId))
      .limit(1);
    let userRow = existing[0];
    let mode: "login" | "register";

    if (userRow) {
      mode = "login";
    } else if (body.mode === "register") {
      const inserted = await db
        .insert(user)
        .values({
          id: newId(),
          email: body.email,
          name: body.email.split("@")[0] ?? body.email,
          nativeUserId: body.userId,
          bridgeLinkedAt: new Date().toISOString(),
          bridgeIssuer: ISSUER,
        })
        .onConflictDoNothing({ target: user.nativeUserId })
        .returning();
      userRow = inserted[0];
      if (!userRow) {
        const raced = await db
          .select()
          .from(user)
          .where(eq(user.nativeUserId, body.userId))
          .limit(1);
        userRow = raced[0];
      }
      mode = "register";
    } else {
      return createResponse({
        code: ApiResponseCode.NotFound,
        message: "user not found; retry with mode=register",
      });
    }

    if (!userRow) {
      return createResponse({
        code: ApiResponseCode.InternalError,
        message: "user upsert failed",
      });
    }

    const session = await createSession(event, userRow.id);
    await setSessionCookie(event, session.token);

    return createResponse({ code: ApiResponseCode.Success }, { mode });
  },
);
