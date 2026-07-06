import { desc, eq } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { games, purchases } from "hub:db:schema";
import { ApiResponseCode } from "#shared/types";
import type { ApiResponse, Purchase } from "#shared/types";

export default defineEventHandler(async (event): Promise<ApiResponse<Purchase>> => {
  const { user } = await requireUserSession(event);

  const id = getRouterParam(event, "id");
  if (!id) {
    return createResponse({
      code: ApiResponseCode.InvalidRequest,
      message: "Missing purchase id",
    });
  }

  const rows = await db
    .select({
      id: purchases.id,
      userId: purchases.userId,
      status: purchases.status,
      qty: purchases.qty,
      pricePaid: purchases.pricePaid,
      paymentMethod: purchases.paymentMethod,
      paymentReference: purchases.paymentReference,
      createdAt: purchases.createdAt,
      updatedAt: purchases.updatedAt,
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
    .where(eq(purchases.id, id))
    .orderBy(desc(purchases.createdAt))
    .limit(1);

  const row = rows[0];
  if (!row || row.userId !== user.id) {
    return createResponse({
      code: ApiResponseCode.NotFound,
      message: "Purchase not found",
    });
  }

  const item: Purchase = {
    id: row.id,
    status: row.status,
    qty: row.qty,
    pricePaid: row.pricePaid,
    paymentMethod: row.paymentMethod,
    paymentReference: row.paymentReference,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    game: row.game,
  };

  return createResponse({ code: ApiResponseCode.Success }, item);
});
