import { eq, sql, sum } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { purchases } from "hub:db:schema";
import { ApiResponseCode } from "#shared/types";
import type { ApiResponse, LibraryStatsData, PurchaseStatus } from "#shared/types";

const EMPTY_BY_STATUS: Record<PurchaseStatus, number> = {
  pending: 0,
  completed: 0,
  failed: 0,
  refunded: 0,
};

export default defineEventHandler(async (event): Promise<ApiResponse<LibraryStatsData>> => {
  const { user } = await requireUserSession(event);

  const [rows, spentRow] = await Promise.all([
    db
      .select({
        status: purchases.status,
        value: sql<number>`count(*)::int`,
      })
      .from(purchases)
      .where(eq(purchases.userId, user.id))
      .groupBy(purchases.status),
    db
      .select({ value: sum(purchases.pricePaid) })
      .from(purchases)
      .where(sql`${purchases.userId} = ${user.id} AND ${purchases.status} = 'completed'`),
  ]);

  const byStatus: Record<PurchaseStatus, number> = { ...EMPTY_BY_STATUS };
  let total = 0;
  for (const row of rows) {
    const status = row.status as PurchaseStatus;
    byStatus[status] = row.value;
    total += row.value;
  }

  return createResponse(
    { code: ApiResponseCode.Success },
    {
      total,
      byStatus,
      totalSpent: spentRow[0]?.value ?? "0",
    },
  );
});
