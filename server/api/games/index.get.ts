import { and, asc, eq, ilike, sql } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { games } from "hub:db:schema";
import { ApiResponseCode } from "#shared/types";
import type { ApiResponse, GameSummary, GamesListData } from "#shared/types";
import { clampLimit, clampOffset } from "#server/utils/pagination";

export default defineEventHandler(async (event): Promise<ApiResponse<GamesListData>> => {
  const query = getQuery(event);
  const search = typeof query.search === "string" ? query.search.trim() : "";
  const category = typeof query.category === "string" && query.category ? query.category : null;
  const limit = clampLimit(query.limit);
  const offset = clampOffset(query.offset);

  const filters = [];
  if (search) filters.push(ilike(games.name, `%${search}%`));
  if (category) filters.push(eq(games.category, category));
  const where = filters.length > 0 ? and(...filters) : undefined;

  const [rows, distinctCategories, countRow] = await Promise.all([
    db
      .select({
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
      })
      .from(games)
      .where(where)
      .orderBy(asc(games.name))
      .limit(limit)
      .offset(offset),
    db.selectDistinct({ category: games.category }).from(games).orderBy(asc(games.category)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(games)
      .where(where),
  ]);

  return createResponse(
    { code: ApiResponseCode.Success },
    {
      items: rows as GameSummary[],
      categories: distinctCategories.map((row) => row.category),
    },
    { total: countRow[0]?.count ?? 0, limit, offset },
  );
});
