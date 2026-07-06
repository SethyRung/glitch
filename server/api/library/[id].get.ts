import { desc, eq } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { games, purchases } from "hub:db:schema";
import { ApiResponseCode } from "#shared/types";
import type { ApiResponse, LibraryItem } from "#shared/types";

export default defineEventHandler(async (event): Promise<ApiResponse<LibraryItem>> => {
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
      status: purchases.status,
      pricePaid: purchases.pricePaid,
      paymentMethod: purchases.paymentMethod,
      paymentReference: purchases.paymentReference,
      createdAt: purchases.createdAt,
      userId: purchases.userId,
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

  const item: LibraryItem = {
    id: row.id,
    status: row.status,
    pricePaid: row.pricePaid,
    paymentMethod: row.paymentMethod,
    paymentReference: row.paymentReference,
    createdAt: row.createdAt.toISOString(),
    game: row.game,
  };

  return createResponse({ code: ApiResponseCode.Success }, item);
});
