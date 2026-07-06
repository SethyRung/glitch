import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { games, purchases } from "hub:db:schema";
import { ApiResponseCode } from "#shared/types";
import type { ApiResponse, LibraryItem, LibraryListData, PurchaseStatus } from "#shared/types";
import { clampLimit, clampOffset } from "#server/utils/pagination";

const VALID_STATUSES: readonly PurchaseStatus[] = ["pending", "completed", "failed", "refunded"];

export default defineEventHandler(async (event): Promise<ApiResponse<LibraryListData>> => {
  const { user } = await requireUserSession(event);

  const query = getQuery(event);
  const status = parseStatus(query.status);
  const limit = clampLimit(query.limit);
  const offset = clampOffset(query.offset);

  const filters = [eq(purchases.userId, user.id)];
  if (status) filters.push(eq(purchases.status, status));
  const where = and(...filters);

  const [rows, totalRow] = await Promise.all([
    db
      .select({
        id: purchases.id,
        status: purchases.status,
        pricePaid: purchases.pricePaid,
        paymentMethod: purchases.paymentMethod,
        paymentReference: purchases.paymentReference,
        createdAt: purchases.createdAt,
        game: {
          id: games.id,
          name: games.name,
          developer: games.developer,
          publisher: games.publisher,
          price: games.price,
          originalPrice: games.originalPrice,
          discountPercent: games.discountPercent,
          imageUrl: games.imageUrl,
          category: games.category,
          releaseDate: games.releaseDate,
          metacriticScore: games.metacriticScore,
          platforms: games.platforms,
        },
      })
      .from(purchases)
      .innerJoin(games, eq(games.id, purchases.gameId))
      .where(where)
      .orderBy(desc(purchases.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(purchases).where(where),
  ]);

  const items: LibraryItem[] = rows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
  })) as LibraryItem[];

  return createResponse(
    { code: ApiResponseCode.Success },
    { items },
    {
      total: totalRow[0]?.value ?? 0,
      limit,
      offset,
    },
  );
});

function parseStatus(raw: unknown): PurchaseStatus | null {
  if (typeof raw !== "string") return null;
  return VALID_STATUSES.includes(raw as PurchaseStatus) ? (raw as PurchaseStatus) : null;
}
