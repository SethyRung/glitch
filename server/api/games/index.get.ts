import { and, asc, eq, ilike, sql } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { games } from "hub:db:schema";

export default defineEventHandler(async (event): Promise<GamesListResponse> => {
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

  return {
    items: rows as GameSummary[],
    total: countRow[0]?.count ?? 0,
    categories: distinctCategories.map((row) => row.category),
  };
});
