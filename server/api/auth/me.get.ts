import { eq } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { users } from "hub:db:schema";
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

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return createResponse({ code: "NotFound" as ResponseCode, message: "User not found" }, null);
    }

    return createResponse(
      { code: "Success" as ResponseCode, message: "User retrieved successfully" },
      {
        id: user.id,
        name: user.name,
        email: user.email,
        balance: user.balance.toString(),
      },
    );
  } catch (error) {
    console.error("Get user error:", error);
    return createResponse(
      { code: "InternalError" as ResponseCode, message: "An error occurred while retrieving user" },
      null,
    );
  }
});
