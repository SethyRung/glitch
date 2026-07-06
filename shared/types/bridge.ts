export interface BridgePayPayload {
  orderGroupId: string;
  purchaseId: string;
  currency: "USD";
  total: string;
  items: Array<{
    gameId: string;
    name: string;
    qty: number;
    lineTotal: string;
  }>;
  merchant: {
    code: "glitch-store";
    name: string;
  };
  externalReference: string;
}

export type BridgePayResult =
  | { status: "completed"; externalReference: string }
  | { status: "failed"; reason: string; externalReference: string }
  | { status: "cancelled"; externalReference: string };
