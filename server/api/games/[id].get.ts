import { eq } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { games } from "hub:db:schema";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      return createResponse(
        { code: ApiResponseCode.InvalidRequest, message: "Game ID is required" },
        null,
      );
    }

    const game = await db.query.games.findFirst({
      where: eq(games.id, id),
    });

    if (!game) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "Game not found" }, null);
    }

    return createResponse(
      { code: ApiResponseCode.Success, message: "Game retrieved successfully" },
      {
        id: game.id,
        name: game.name,
        description: game.description,
        price: game.price.toString(),
        imageUrl: game.imageUrl,
        category: game.category,
        stock: game.stock,
        createdAt: game.createdAt?.toISOString() ?? null,
        updatedAt: game.updatedAt?.toISOString() ?? null,
      },
    );
  } catch (error) {
    console.error("Get game error:", error);
    return createResponse(
      {
        code: ApiResponseCode.InternalError,
        message: "An error occurred while retrieving game",
      },
      null,
    );
  }
});
