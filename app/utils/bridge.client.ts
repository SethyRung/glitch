/**
 * WebViewJavascriptBridge helpers for Glitch. The protocol is shared between
 * Lision's iOS implementation (https://github.com/Lision/WKWebViewJavascriptBridge)
 * and the Android port at https://github.com/RDSunhy/WebViewJavascriptBridge.
 *
 * Usage:
 *   const bridge = getBridge()
 *   bridge?.callHandler("wallet.requestPayment", payload, (response) => { ... })
 *
 * Sync return. On iOS WKWebView the global is pre-installed and the call
 * returns immediately. On Android the call triggers `InjectJavascript.init()`
 * and returns null; the native side then assigns `window.WKWebViewJavascriptBridge`
 * once the bootstrap completes — callers poll the global if they need to wait.
 *
 * The Android port stringifies the response callback payload; iOS forwards an
 * object. Always JSON-parse defensively.
 *
 * File is client-only via the `.client.ts` suffix so the helpers never touch
 * `window` during SSR.
 */

export interface Bridge {
  callHandler(handlerName: string, data: unknown, cb?: (response: unknown) => void): void;
  registerHandler(
    handlerName: string,
    handler: (data: unknown, cb?: (response: unknown) => void) => void,
  ): void;
}

declare global {
  interface Window {
    webkit?: {
      messageHandlers?: {
        iOS_Native_InjectJavascript?: { postMessage: (message: unknown) => void };
      };
    };
    InjectJavascript?: { init: () => void };
    WKWebViewJavascriptBridge?: Bridge;
    WKWVJBCallbacks?: Array<(b: Bridge) => void>;
  }
}

/**
 * Returns the installed WebViewJavascriptBridge, or `null` if not yet
 * available. Triggers both platform bootstrap hooks on the first call —
 * each optional chain short-circuits when the corresponding WebView APIs
 * are absent, so no UA sniffing is needed. Idempotent.
 */
export function getBridge(): Bridge | null {
  if (typeof window === "undefined") return null;
  if (window.WKWebViewJavascriptBridge) return window.WKWebViewJavascriptBridge;

  window.webkit?.messageHandlers?.iOS_Native_InjectJavascript?.postMessage(null);
  window.InjectJavascript?.init();

  return window.WKWebViewJavascriptBridge ?? null;
}
