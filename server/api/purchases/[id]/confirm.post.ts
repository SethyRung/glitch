import { and, eq } from "drizzle-orm";
import { readBody } from "h3";
import { db } from "@nuxthub/db";
import { purchases } from "hub:db:schema";
import { ApiResponseCode } from "#shared/types";
import type { ApiResponse, PurchaseStatus, PurchaseStatusUpdateRequest } from "#shared/types";

const TERMINAL_TRANSITIONS: Record<PurchaseStatus, readonly PurchaseStatus[]> = {
  pending: ["completed", "failed"],
  completed: [],
  failed: [],
  refunded: [],
};

export default defineEventHandler(
  async (
    event,
  ): Promise<ApiResponse<{ orderGroupId: string; status: PurchaseStatus; updated: number }>> => {
    const { user } = await requireUserSession(event);

    const id = getRouterParam(event, "id");
    if (!id) {
      return createResponse({
        code: ApiResponseCode.InvalidRequest,
        message: "Missing purchase id",
      });
    }

    const body = await readBody<PurchaseStatusUpdateRequest>(event).catch(() => null);
    const nextStatus = body?.status;
    if (nextStatus !== "completed" && nextStatus !== "failed") {
      return createResponse({
        code: ApiResponseCode.InvalidRequest,
        message: "status must be 'completed' or 'failed'",
      });
    }
    const paymentReference = sanitizeString(body?.paymentReference) ?? null;
    const paymentMethod = sanitizeString(body?.paymentMethod) ?? null;

    const rows = await db
      .select({
        id: purchases.id,
        userId: purchases.userId,
        status: purchases.status,
        orderGroupId: purchases.orderGroupId,
      })
      .from(purchases)
      .where(eq(purchases.id, id))
      .limit(1);

    const row = rows[0];
    if (!row || row.userId !== user.id) {
      return createResponse({
        code: ApiResponseCode.NotFound,
        message: "Purchase not found",
      });
    }

    const allowed = TERMINAL_TRANSITIONS[row.status as PurchaseStatus] ?? [];
    if (!allowed.includes(nextStatus)) {
      return createResponse({
        code: ApiResponseCode.InvalidRequest,
        message: `Cannot transition from ${row.status} to ${nextStatus}`,
      });
    }

    if (!row.orderGroupId) {
      return createResponse({
        code: ApiResponseCode.InternalError,
        message: "Purchase is missing order group identifier",
      });
    }

    const updated = await db
      .update(purchases)
      .set({
        status: nextStatus,
        paymentMethod: paymentMethod ?? undefined,
        paymentReference: paymentReference ?? undefined,
      })
      .where(
        and(
          eq(purchases.userId, user.id),
          eq(purchases.orderGroupId, row.orderGroupId),
          eq(purchases.status, "pending"),
        ),
      )
      .returning({ id: purchases.id });

    return createResponse(
      { code: ApiResponseCode.Success },
      {
        orderGroupId: row.orderGroupId,
        status: nextStatus,
        updated: updated.length,
      },
    );
  },
);

function sanitizeString(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.length > 200) return null;
  return trimmed;
}
