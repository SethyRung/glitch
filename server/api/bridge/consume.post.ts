import { eq } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { user } from "hub:db:schema";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ ticket?: unknown }>(event);
  if (typeof body?.ticket !== "string") {
    return createResponse({ code: ApiResponseCode.InvalidRequest, message: "missing ticket" });
  }

  const payload = verifyTicket(body.ticket);
  if (!payload) {
    return createResponse({
      code: ApiResponseCode.InvalidRequest,
      message: "invalid or expired ticket",
    });
  }

  const redirect = sanitizeRedirect(payload.redirect);
  if (redirect === null) {
    return createResponse({ code: ApiResponseCode.InvalidRequest, message: "invalid redirect" });
  }

  const claimed = await claimTicket(payload.jti);
  if (!claimed) {
    return createResponse({
      code: ApiResponseCode.InvalidRequest,
      message: "ticket already used",
    });
  }

  try {
    const rows = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.nativeUserId, payload.sub))
      .limit(1);
    const bridgeUser = rows[0];

    if (!bridgeUser) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "user not found" });
    }

    const session = await createSession(event, bridgeUser.id);
    await setSessionCookie(event, session.token);
  } catch {
    await releaseTicketClaim(payload.jti);
    return createResponse({
      code: ApiResponseCode.InternalError,
      message: "consume failed",
    });
  }

  return await sendRedirect(event, redirect, 302);
});
