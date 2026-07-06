export type PurchaseStatus = "pending" | "completed" | "failed" | "refunded";

/**
 * A purchase row joined with the slim game shape used in the library views.
 * Anything more (description, screenshots, etc.) belongs on the game detail
 * page, not in a library card or receipt.
 */
export interface LibraryItem {
  id: string;
  status: PurchaseStatus;
  pricePaid: string;
  paymentMethod: string | null;
  paymentReference: string | null;
  createdAt: string;
  game: GameSummary;
}

/**
 * Body of the `data` field in a successful GET /api/library response. The
 * total + limit + offset live in the envelope's `meta`.
 */
export interface LibraryListData {
  items: LibraryItem[];
}

export interface LibraryStatsData {
  total: number;
  byStatus: Record<PurchaseStatus, number>;
  totalSpent: string;
}
