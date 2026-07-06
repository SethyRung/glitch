import type { GameSummary } from "./games";

export const PURCHASE_STATUSES = ["pending", "completed", "failed", "refunded"] as const;

export interface PurchaseItemInput {
  gameId: string;
  qty: number;
}

export interface CreatePurchasesRequest {
  items: PurchaseItemInput[];
  idempotencyKey?: string;
}

export interface PurchaseLine extends GameSummary {
  lineId: string;
  qty: number;
  pricePaid: string;
}

export interface Purchase {
  id: string;
  status: PurchaseStatus;
  qty: number;
  pricePaid: string;
  paymentMethod: string | null;
  paymentReference: string | null;
  createdAt: string;
  updatedAt: string;
  game: GameSummary;
}

export interface CreatePurchasesData {
  orderGroupId: string;
  currency: "USD";
  subtotal: string;
  totalQty: number;
  lineCount: number;
  purchases: Purchase[];
}

export interface PurchaseStatusUpdateRequest {
  status: "completed" | "failed";
  paymentReference?: string;
  paymentMethod?: string;
}
