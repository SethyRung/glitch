import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export interface TicketPayload {
  sub: string;
  jti: string;
  exp: number;
  redirect?: string;
}

const TICKET_TTL_SECONDS = 60;

export function mintTicket(input: { sub: string; redirect?: string }): {
  payload: TicketPayload;
  raw: string;
} {
  const { bridgeTicketSecret } = useRuntimeConfig();
  if (!bridgeTicketSecret) throw new Error("NUXT_BRIDGE_TICKET_SECRET is not configured");

  const payload: TicketPayload = {
    sub: input.sub,
    jti: randomBytes(16).toString("hex"),
    exp: Math.floor(Date.now() / 1000) + TICKET_TTL_SECONDS,
    ...(input.redirect !== undefined ? { redirect: input.redirect } : {}),
  };

  const encoded = encodePayload(payload);
  const sig = signEncoded(bridgeTicketSecret, encoded);

  return { payload, raw: `${encoded}.${sig}` };
}

export function verifyTicket(raw: string) {
  const { bridgeTicketSecret } = useRuntimeConfig();
  if (!bridgeTicketSecret) return null;

  const parts = raw.split(".");
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  if (!encoded || !sig) return null;

  const expectedSig = signEncoded(bridgeTicketSecret, encoded);

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expectedBuf)) return null;

  const parsed = decodePayload(encoded);
  if (!parsed) return null;

  if (parsed.exp <= Math.floor(Date.now() / 1000)) return null;

  return parsed;
}

export function sanitizeRedirect(raw: string | undefined): string | null {
  if (!raw) return "/";
  if (!raw.startsWith("/")) return null;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return null;
  return raw;
}

function encodePayload(payload: TicketPayload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(encoded: string) {
  let text: string;
  try {
    text = Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  if (!isTicketPayload(parsed)) return null;
  return parsed;
}

function isTicketPayload(v: unknown): v is TicketPayload {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  if (typeof o.sub !== "string" || o.sub.length === 0) return false;
  if (typeof o.jti !== "string" || o.jti.length === 0) return false;
  if (typeof o.exp !== "number" || !Number.isFinite(o.exp)) return false;
  if (o.redirect !== undefined) {
    if (typeof o.redirect !== "string") return false;
    if (o.redirect.length === 0) return false;
  }
  return true;
}

function signEncoded(secret: string, encoded: string): string {
  return createHmac("sha256", secret).update(encoded).digest().toString("base64url");
}
