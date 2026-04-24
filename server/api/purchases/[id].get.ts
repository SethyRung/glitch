import { and, eq } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { purchases } from "hub:db:schema";

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.user?.userId;

    if (!userId) {
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "User not authenticated" },
        null,
      );
    }

    const id = getRouterParam(event, "id");

    if (!id) {
      return createResponse(
        { code: ApiResponseCode.InvalidRequest, message: "Purchase ID is required" },
        null,
      );
    }

    const purchase = await db.query.purchases.findFirst({
      where: and(eq(purchases.id, id), eq(purchases.userId, userId)),
      with: {
        game: {
          columns: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            category: true,
          },
        },
      },
    });

    if (!purchase) {
      return createResponse(
        { code: ApiResponseCode.NotFound, message: "Purchase not found" },
        null,
      );
    }

    return createResponse(
      { code: ApiResponseCode.Success, message: "Purchase retrieved successfully" },
      {
        id: purchase.id,
        userId: purchase.userId,
        gameId: purchase.gameId,
        game: purchase.game
          ? {
              id: (purchase.game as { id: string }).id,
              name: (purchase.game as { name: string }).name,
              description: (purchase.game as { description: string | null }).description,
              imageUrl: (purchase.game as { imageUrl: string | null }).imageUrl,
              category: (purchase.game as { category: string | null }).category,
            }
          : null,
        amount: purchase.amount.toString(),
        quantity: purchase.quantity,
        status: purchase.status,
        merchantReference: purchase.merchantReference,
        createdAt: purchase.createdAt?.toISOString() ?? null,
        updatedAt: purchase.updatedAt?.toISOString() ?? null,
      },
    );
  } catch (error) {
    console.error("Get purchase error:", error);
    return createResponse(
      {
        code: ApiResponseCode.InternalError,
        message: "An error occurred while retrieving purchase",
      },
      null,
    );
  }
});
