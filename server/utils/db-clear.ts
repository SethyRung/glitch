import { count, sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { kv } from "@nuxthub/kv";
import { db } from "@nuxthub/db";
import { account, games, purchases, session, user, verification } from "hub:db:schema";

export interface ClearCounts {
  games: number;
  purchases: number;
  user: number;
  session: number;
  account: number;
  verification: number;
}

export async function clearDb(): Promise<ClearCounts> {
  const counts: ClearCounts = {
    games: await tableCount(games),
    purchases: await tableCount(purchases),
    user: await tableCount(user),
    session: await tableCount(session),
    account: await tableCount(account),
    verification: await tableCount(verification),
  };

  await db.execute(
    sql`TRUNCATE TABLE "games", "purchases", "user", "session", "account", "verification" RESTART IDENTITY CASCADE`,
  );

  await kv.clear();

  return counts;
}

async function tableCount(table: PgTable): Promise<number> {
  const [row] = await db.select({ n: count() }).from(table);
  return row?.n ?? 0;
}
