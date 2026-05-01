import { desc, eq, sql } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { games, purchases, users } from "hub:db:schema";

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.user?.userId;

    if (!userId) {
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "User not authenticated" },
        null,
      );
    }

    const body = await readBody(event);

    if (!body?.items || !Array.isArray(body.items) || body.items.length === 0) {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "Items are required" },
        null,
      );
    }

    for (const item of body.items) {
      if (!item.gameId || !item.quantity || item.quantity < 1) {
        return createResponse(
          {
            code: ApiResponseCode.ValidationError,
            message: "Each item must have a gameId and a valid quantity",
          },
          null,
        );
      }
    }

    const gameIds = body.items.map((item: { gameId: string }) => item.gameId);

    const gameList = await db.query.games.findMany({
      where: sql`${games.id} IN ${gameIds}`,
    });

    if (gameList.length !== gameIds.length) {
      const foundIds = new Set(gameList.map((g) => g.id));
      const missing = gameIds.filter((id: string) => !foundIds.has(id));
      return createResponse(
        { code: ApiResponseCode.NotFound, message: `Games not found: ${missing.join(", ")}` },
        null,
      );
    }

    const gameMap = new Map(gameList.map((g) => [g.id, g]));

    for (const item of body.items) {
      const game = gameMap.get(item.gameId);
      if (game!.stock < item.quantity) {
        return createResponse(
          {
            code: ApiResponseCode.ValidationError,
            message: `Insufficient stock for "${game!.name}" (available: ${game!.stock}, requested: ${item.quantity})`,
          },
          null,
        );
      }
    }

    let totalAmount = 0;
    const lineItems = body.items.map((item: { gameId: string; quantity: number }) => {
      const game = gameMap.get(item.gameId)!;
      const amount = Number(game.price) * item.quantity;
      totalAmount += amount;
      return { gameId: item.gameId, quantity: item.quantity, amount };
    });

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "User not found" }, null);
    }

    if (Number(user.balance) < totalAmount) {
      return createResponse(
        {
          code: ApiResponseCode.ValidationError,
          message: `Insufficient balance (balance: $${user.balance}, total: $${totalAmount.toFixed(2)})`,
        },
        null,
      );
    }

    const newBalance = (Number(user.balance) - totalAmount).toFixed(2);

    await db
      .update(users)
      .set({ balance: newBalance, updatedAt: new Date() })
      .where(eq(users.id, userId));

    const createdPurchases = await db
      .insert(purchases)
      .values(
        lineItems.map((item: { gameId: any; amount: number; quantity: any }) => ({
          userId,
          gameId: item.gameId,
          amount: item.amount.toFixed(2),
          quantity: item.quantity,
          status: "completed",
        })),
      )
      .returning();

    for (const item of body.items) {
      const game = gameMap.get(item.gameId)!;
      await db
        .update(games)
        .set({ stock: game.stock - item.quantity, updatedAt: new Date() })
        .where(eq(games.id, item.gameId));
    }

    const purchaseIds = createdPurchases.map((p) => p.id);

    const resultList = await db.query.purchases.findMany({
      where: sql`${purchases.id} IN ${purchaseIds}`,
      with: {
        game: {
          columns: {
            id: true,
            name: true,
            imageUrl: true,
            category: true,
          },
        },
      },
      orderBy: [desc(purchases.createdAt)],
    });

    return createResponse(
      { code: ApiResponseCode.Success, message: "Purchases created successfully" },
      resultList.map((purchase) => ({
        id: purchase.id,
        userId: purchase.userId,
        gameId: purchase.gameId,
        game: purchase.game
          ? {
              id: purchase.game.id,
              name: purchase.game.name,
              imageUrl: purchase.game.imageUrl,
              category: purchase.game.category,
            }
          : null,
        amount: purchase.amount.toString(),
        quantity: purchase.quantity,
        status: purchase.status,
        merchantReference: purchase.merchantReference,
        createdAt: purchase.createdAt?.toISOString() ?? null,
        updatedAt: purchase.updatedAt?.toISOString() ?? null,
      })),
    );
  } catch {
    return createResponse(
      {
        code: ApiResponseCode.InternalError,
        message: "An error occurred while creating purchases",
      },
      null,
    );
  }
});
