import { and, count as countFn, desc, eq } from "drizzle-orm";
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
      { code: ApiResponseCode.Success, message: "Purchases retrieved successfully" },
      purchaseList.map((purchase) => ({
        ...purchase,
        amount: purchase.amount.toString(),
        createdAt: purchase.createdAt?.toISOString() ?? null,
        updatedAt: purchase.updatedAt?.toISOString() ?? null,
      })),
      { total: Number(count), limit: validLimit, offset: validOffset },
    );
  } catch {
    return createResponse(
      {
        code: ApiResponseCode.InternalError,
        message: "An error occurred while retrieving purchases",
      },
      null,
    );
  }
});
