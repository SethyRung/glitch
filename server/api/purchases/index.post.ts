import { and, eq, inArray } from "drizzle-orm";
import { readBody } from "h3";
import { db } from "@nuxthub/db";
import { games, purchases } from "hub:db:schema";
import { ApiResponseCode } from "#shared/types";
import type {
  ApiResponse,
  CreatePurchasesData,
  CreatePurchasesRequest,
  Purchase,
  PurchaseItemInput,
} from "#shared/types";

const MIN_QTY = 1;
const MAX_QTY = 99;
const MAX_LINE_ITEMS = 99;
const MAX_IDEMPOTENCY_KEY_LEN = 128;

function clampQty(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return MIN_QTY;
  return Math.min(MAX_QTY, Math.floor(n));
}

function cleanIdempotencyKey(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.length > MAX_IDEMPOTENCY_KEY_LEN) return null;
  // Allow only "safe" characters; reject anything that could log-inject.
  if (!/^[A-Za-z0-9_\-:.@]+$/.test(trimmed)) return null;
  return trimmed;
}

function normalizeItems(raw: unknown): PurchaseItemInput[] | null {
  if (!Array.isArray(raw)) return null;
  if (raw.length === 0 || raw.length > MAX_LINE_ITEMS) return null;
  const seen = new Set<string>();
  const out: PurchaseItemInput[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") return null;
    const obj = entry as Record<string, unknown>;
    const gameId = obj.gameId;
    if (typeof gameId !== "string" || !gameId.trim()) return null;
    if (seen.has(gameId)) return null;
    seen.add(gameId);
    out.push({ gameId, qty: clampQty(obj.qty) });
  }
  return out;
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function toPurchase(row: {
  id: string;
  status: Purchase["status"];
  qty: number;
  pricePaid: string;
  paymentMethod: string | null;
  paymentReference: string | null;
  createdAt: Date;
  updatedAt: Date;
  game: Purchase["game"];
}): Purchase {
  return {
    id: row.id,
    status: row.status,
    qty: row.qty,
    pricePaid: row.pricePaid,
    paymentMethod: row.paymentMethod,
    paymentReference: row.paymentReference,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    game: row.game,
  };
}

export default defineEventHandler(async (event): Promise<ApiResponse<CreatePurchasesData>> => {
  const { user } = await requireUserSession(event);

  const body = await readBody<CreatePurchasesRequest>(event).catch(() => null);
  const items = normalizeItems(body?.items);
  if (!items) {
    return createResponse({
      code: ApiResponseCode.InvalidRequest,
      message: "Invalid items: expected non-empty array of { gameId, qty }.",
    });
  }
  const idempotencyKey = cleanIdempotencyKey(body?.idempotencyKey);

  const gameIds = items.map((i) => i.gameId);
  const existing = await db
    .select({ id: games.id, price: games.price })
    .from(games)
    .where(inArray(games.id, gameIds));
  const priceByGame = new Map(existing.map((g) => [g.id, g.price] as const));
  for (const item of items) {
    if (!priceByGame.has(item.gameId)) {
      return createResponse({
        code: ApiResponseCode.NotFound,
        message: `Game not found: ${item.gameId}`,
      });
    }
  }

  if (idempotencyKey) {
    const replay = await db
      .select({ id: purchases.id })
      .from(purchases)
      .where(and(eq(purchases.userId, user.id), eq(purchases.idempotencyKey, idempotencyKey)))
      .limit(1);
    if (replay[0]) {
      return await buildResponse(event, {
        userId: user.id,
        idempotencyKey,
        replayOrderGroupHint: replay[0].id,
      });
    }
  }

  const orderGroupId = newId();
  await db.transaction(async (tx) => {
    const rows = [];
    for (const item of items) {
      const unitPrice = priceByGame.get(item.gameId)!;
      const lineTotal = (Number(unitPrice) * item.qty).toFixed(2);
      const rowId = newId();
      rows.push({
        id: rowId,
        userId: user.id,
        gameId: item.gameId,
        qty: item.qty,
        pricePaid: lineTotal,
        status: "pending" as const,
        paymentMethod: null,
        paymentReference: null,
        orderGroupId,
        idempotencyKey: rows.length === 0 ? idempotencyKey : null,
      });
    }
    await tx.insert(purchases).values(rows);
  });

  return await hydrate(orderGroupId);
});

async function hydrate(orderGroupId: string): Promise<ApiResponse<CreatePurchasesData>> {
  const rows = await fetchGroup(orderGroupId);
  if (rows.length === 0) {
    return createResponse({
      code: ApiResponseCode.InternalError,
      message: "Failed to create order",
    });
  }
  return buildDataResponse(rows);
}

async function buildResponse(
  _event: import("h3").H3Event,
  args: { userId: string; idempotencyKey: string; replayOrderGroupHint: string },
): Promise<ApiResponse<CreatePurchasesData>> {
  const rows = await db
    .select({
      id: purchases.id,
      userId: purchases.userId,
      gameId: purchases.gameId,
      qty: purchases.qty,
      pricePaid: purchases.pricePaid,
      status: purchases.status,
      paymentMethod: purchases.paymentMethod,
      paymentReference: purchases.paymentReference,
      orderGroupId: purchases.orderGroupId,
      idempotencyKey: purchases.idempotencyKey,
      createdAt: purchases.createdAt,
      updatedAt: purchases.updatedAt,
      game: {
        id: games.id,
        name: games.name,
        developer: games.developer,
        publisher: games.publisher,
        price: games.price,
        originalPrice: games.originalPrice,
        discountPercent: games.discountPercent,
        imageUrl: games.imageUrl,
        category: games.category,
        releaseDate: games.releaseDate,
        metacriticScore: games.metacriticScore,
        platforms: games.platforms,
      },
    })
    .from(purchases)
    .innerJoin(games, eq(games.id, purchases.gameId))
    .where(
      and(eq(purchases.userId, args.userId), eq(purchases.idempotencyKey, args.idempotencyKey)),
    );

  if (rows.length === 0) {
    return createResponse({
      code: ApiResponseCode.InternalError,
      message: "Idempotency replay lookup failed",
    });
  }
  return buildDataResponse(rows);
}

async function fetchGroup(orderGroupId: string) {
  return await db
    .select({
      id: purchases.id,
      userId: purchases.userId,
      gameId: purchases.gameId,
      qty: purchases.qty,
      pricePaid: purchases.pricePaid,
      status: purchases.status,
      paymentMethod: purchases.paymentMethod,
      paymentReference: purchases.paymentReference,
      orderGroupId: purchases.orderGroupId,
      idempotencyKey: purchases.idempotencyKey,
      createdAt: purchases.createdAt,
      updatedAt: purchases.updatedAt,
      game: {
        id: games.id,
        name: games.name,
        developer: games.developer,
        publisher: games.publisher,
        price: games.price,
        originalPrice: games.originalPrice,
        discountPercent: games.discountPercent,
        imageUrl: games.imageUrl,
        category: games.category,
        releaseDate: games.releaseDate,
        metacriticScore: games.metacriticScore,
        platforms: games.platforms,
      },
    })
    .from(purchases)
    .innerJoin(games, eq(games.id, purchases.gameId))
    .where(eq(purchases.orderGroupId, orderGroupId));
}

function buildDataResponse(
  rows: Awaited<ReturnType<typeof fetchGroup>>,
): ApiResponse<CreatePurchasesData> {
  const purchasesOut: Purchase[] = rows.map((r) =>
    toPurchase({
      id: r.id,
      status: r.status,
      qty: r.qty,
      pricePaid: r.pricePaid,
      paymentMethod: r.paymentMethod,
      paymentReference: r.paymentReference,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      game: r.game,
    }),
  );
  const subtotalMinor = rows.reduce((acc, r) => acc + Math.round(Number(r.pricePaid) * 100), 0);
  const totalQty = rows.reduce((acc, r) => acc + r.qty, 0);
  return createResponse(
    { code: ApiResponseCode.Success },
    {
      orderGroupId: rows[0]!.orderGroupId!,
      currency: "USD",
      subtotal: (subtotalMinor / 100).toFixed(2),
      totalQty,
      lineCount: rows.length,
      purchases: purchasesOut,
    },
    { total: rows.length, limit: rows.length, offset: 0 },
  );
}
