import { eq } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { games } from "hub:db:schema";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    return createResponse({
      code: ApiResponseCode.InvalidRequest,
      message: "Missing game id",
    });
  }

  const rows = await db.select().from(games).where(eq(games.id, id)).limit(1);

  const row = rows[0];
  if (!row) {
    return createResponse({
      code: ApiResponseCode.NotFound,
      message: "Game not found",
    });
  }

  return createResponse({ code: ApiResponseCode.Success }, row as Game);
});
