import { kv } from "@nuxthub/kv";

const TICKET_CLAIM_TTL_SECONDS = 120;

function ticketClaimKey(jti: string): string {
  return `bridge:ticket:consumed:${jti}`;
}

export async function claimTicket(jti: string): Promise<boolean> {
  const key = ticketClaimKey(jti);
  if (await kv.has(key)) return false;
  await kv.set(key, "1", { ttl: TICKET_CLAIM_TTL_SECONDS });
  return true;
}

export async function releaseTicketClaim(jti: string): Promise<void> {
  await kv.del(ticketClaimKey(jti)).catch(() => {});
}
