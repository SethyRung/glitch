const BRIDGE_POLL_TIMEOUT_MS = 3_000;
const PAY_TIMEOUT_MS = 30_000;

interface FinalizeArgs {
  status: "completed" | "failed";
  paymentReference?: string;
  paymentMethod?: "easypay-bridge" | "web-fallback" | "easypay-bridge-failed";
}

interface WalletBridge {
  available: Ref<boolean>;
  pay: (payload: BridgePayPayload) => Promise<BridgePayResult>;
  finalize: (purchaseId: string, args: FinalizeArgs) => Promise<void>;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function waitForBridge(timeoutMs: number): Promise<Bridge | null> {
  let bridge = getBridge();
  if (bridge) return bridge;
  const start = Date.now();
  while (!bridge && Date.now() - start < timeoutMs) {
    await sleep(100);
    bridge = getBridge();
  }
  return bridge;
}

/**
 * Wraps the callback-based `bridge.callHandler(...)` in an async function.
 * Rejects with `Error("bridge timeout")` if no response arrives within
 * `timeoutMs`. The response payload is JSON-parsed defensively (Android
 * stringifies, iOS forwards an object).
 */
function bridgeCall(
  bridge: Bridge,
  name: string,
  payload: unknown,
  timeoutMs: number,
): Promise<{ status?: string; reason?: string }> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("bridge timeout")), timeoutMs);
    bridge.callHandler(name, payload, (raw) => {
      clearTimeout(timer);
      if (raw && typeof raw === "object") {
        resolve(raw as { status?: string; reason?: string });
        return;
      }
      if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            resolve(parsed as { status?: string; reason?: string });
            return;
          }
        } catch {
          /* not JSON — fall through */
        }
      }
      resolve({});
    });
  });
}

export function useWalletBridge(): WalletBridge {
  const available = ref(false);

  onMounted(() => {
    getBridge();
    let polls = 0;
    const tick = setInterval(() => {
      if (getBridge()) {
        available.value = true;
        clearInterval(tick);
      } else if (++polls > 30) {
        clearInterval(tick);
      }
    }, 200);
  });

  async function finalize(purchaseId: string, args: FinalizeArgs): Promise<void> {
    const body: Record<string, string> = { status: args.status };
    if (args.paymentReference) body.paymentReference = args.paymentReference;
    const paymentMethod =
      args.paymentMethod ??
      (args.status === "completed" ? "easypay-bridge" : "easypay-bridge-failed");
    body.paymentMethod = paymentMethod;
    const res = await $fetch<ApiResponse<unknown>>(`/api/purchases/${purchaseId}/status`, {
      method: "POST",
      body,
    });
    if (!isSuccessResponse(res)) {
      throw new Error(res.status.message || "Failed to update purchase status");
    }
  }

  async function pay(payload: BridgePayPayload): Promise<BridgePayResult> {
    const ref = payload.orderGroupId;
    const bridge = await waitForBridge(BRIDGE_POLL_TIMEOUT_MS);

    if (!bridge) {
      await finalize(payload.purchaseId, {
        status: "completed",
        paymentReference: `web-fallback:${ref}`,
        paymentMethod: "web-fallback",
      });
      return { status: "completed", externalReference: ref };
    }

    available.value = true;

    let parsed: { status?: string; reason?: string };
    try {
      parsed = await bridgeCall(bridge, "wallet.requestPayment", payload, PAY_TIMEOUT_MS);
    } catch {
      await finalize(payload.purchaseId, {
        status: "failed",
        paymentReference: `bridge-timeout:${ref}`,
      }).catch(() => {});
      return { status: "failed", reason: "bridge timeout", externalReference: ref };
    }

    if (parsed.status === "completed") {
      await finalize(payload.purchaseId, {
        status: "completed",
        paymentReference: ref,
      });
      return { status: "completed", externalReference: ref };
    }

    await finalize(payload.purchaseId, {
      status: "failed",
      paymentReference: ref,
    });
    return {
      status: "failed",
      reason:
        parsed.status === "failed"
          ? (parsed.reason ?? "wallet declined")
          : "wallet returned no status",
      externalReference: ref,
    };
  }

  return { available, pay, finalize };
}
