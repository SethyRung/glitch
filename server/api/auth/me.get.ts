import { eq } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { users } from "hub:db:schema";

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.user?.userId;

    if (!userId) {
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "User not authenticated" },
        null,
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "User not found" }, null);
    }

    return createResponse(
      { code: ApiResponseCode.Success, message: "User retrieved successfully" },
      {
        id: user.id,
        email: user.email,
        name: user.name,
        balance: user.balance,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    );
  } catch {
    return createResponse(
      {
        code: ApiResponseCode.InternalError,
        message: "An error occurred while retrieving user",
      },
      null,
    );
  }
});
