import type { NitroFetchRequest, NitroFetchOptions } from "nitropack";

export function useApi<
  T = unknown,
  R extends NitroFetchRequest = NitroFetchRequest,
  O extends NitroFetchOptions<R> = NitroFetchOptions<R>,
>(req: R, opts?: O) {
  const nuxtApp = useNuxtApp();
  return nuxtApp.$fetch<T, R, O>(req, opts);
}
