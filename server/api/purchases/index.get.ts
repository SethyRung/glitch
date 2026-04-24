import { and, count as countFn, desc, eq } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { purchases } from "hub:db:schema";
import type { ResponseCode } from "#shared/types";
import { createResponse } from "#server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.user?.userId;

    if (!userId) {
      return createResponse(
        { code: "Unauthorized" as ResponseCode, message: "User not authenticated" },
        null,
      );
    }

    const query = getQuery(event);

    const limit = query.limit ? parseInt(query.limit as string, 10) : 20;
    const offset = query.offset ? parseInt(query.offset as string, 10) : 0;

    const validLimit = Math.min(Math.max(limit, 1), 100);
    const validOffset = Math.max(offset, 0);

    const status = query.status as string | undefined;

    const conditions = [eq(purchases.userId, userId)];
    if (status) {
      conditions.push(eq(purchases.status, status));
    }

    const whereClause = and(...conditions);

    const countResult = await db.select({ count: countFn() }).from(purchases).where(whereClause);
    const count = countResult[0]?.count ?? 0;

    const purchaseList = await db.query.purchases.findMany({
      where: whereClause,
      with: {
        game: {
          columns: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
      limit: validLimit,
      offset: validOffset,
      orderBy: [desc(purchases.createdAt)],
    });

    return createResponse(
      { code: "Success" as ResponseCode, message: "Purchases retrieved successfully" },
      purchaseList.map((purchase) => ({
        id: purchase.id,
        userId: purchase.userId,
        gameId: purchase.gameId,
        gameName:
          purchase.game && typeof purchase.game === "object" && "name" in purchase.game
            ? (purchase.game as { name: string }).name
            : null,
        gameImageUrl:
          purchase.game && typeof purchase.game === "object" && "imageUrl" in purchase.game
            ? (purchase.game as { imageUrl: string | null }).imageUrl
            : null,
        amount: purchase.amount.toString(),
        quantity: purchase.quantity,
        status: purchase.status,
        merchantReference: purchase.merchantReference,
        createdAt: purchase.createdAt?.toISOString() ?? null,
        updatedAt: purchase.updatedAt?.toISOString() ?? null,
      })) as unknown[],
      { total: Number(count), limit: validLimit, offset: validOffset },
    );
  } catch (error) {
    console.error("Get purchases error:", error);
    return createResponse(
      {
        code: "InternalError" as ResponseCode,
        message: "An error occurred while retrieving purchases",
      },
      null,
    );
  }
});
