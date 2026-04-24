import { and, count as countFn, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { games } from "hub:db:schema";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    const limit = query.limit ? parseInt(query.limit as string, 10) : 20;
    const offset = query.offset ? parseInt(query.offset as string, 10) : 0;

    const validLimit = Math.min(Math.max(limit, 1), 100);
    const validOffset = Math.max(offset, 0);

    const category = query.category as string | undefined;
    const search = query.search as string | undefined;

    const conditions = [];

    if (category) {
      conditions.push(eq(games.category, category));
    }

    if (search) {
      conditions.push(
        or(ilike(games.name, `%${search}%`), ilike(games.description, `%${search}%`))!,
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const countResult = await db.select({ count: countFn() }).from(games).where(whereClause);
    const count = countResult[0]?.count ?? 0;

    const gameList = await db.query.games.findMany({
      where: whereClause,
      limit: validLimit,
      offset: validOffset,
      orderBy: [desc(games.createdAt)],
    });

    return createResponse(
      { code: ApiResponseCode.Success, message: "Games retrieved successfully" },
      gameList.map((game) => ({
        id: game.id,
        name: game.name,
        description: game.description,
        price: game.price.toString(),
        imageUrl: game.imageUrl,
        category: game.category,
        stock: game.stock,
        createdAt: game.createdAt?.toISOString() ?? null,
        updatedAt: game.updatedAt?.toISOString() ?? null,
      })),
      { total: Number(count), limit: validLimit, offset: validOffset },
    );
  } catch (error) {
    console.error("Get games error:", error);
    return createResponse(
      {
        code: ApiResponseCode.InternalError,
        message: "An error occurred while retrieving games",
      },
      null,
    );
  }
});
