let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export const useApiFetch = createUseFetch((options) => {
  const config = useRuntimeConfig();
  const REFRESH_TOKEN_ENDPOINT = "/api/auth/refresh";

  return {
    baseURL: config.public.baseURL,
    timeout: 10000,
    server: false,
    onResponse: async (context) => {
      if (!context.response.ok) return;

      const data = context.response._data as ApiResponse<unknown>;
      if (data?.status?.code !== ApiResponseCode.Unauthorized) return;

      if (isRefreshing && refreshPromise) {
        const success = await refreshPromise;
        if (!success) return;

        const repeatRes = await $fetch.raw(context.request, {
          ...context.options,
          onResponse: undefined,
          method: context.options.method as any,
        });
        context.response._data = repeatRes._data;
        return;
      }

      isRefreshing = true;
      refreshPromise = $fetch
        .raw(REFRESH_TOKEN_ENDPOINT, {
          baseURL: config.public.baseURL,
          method: "POST",
          timeout: 10000,
        })
        .then((res) => res._data?.status?.code === ApiResponseCode.Success)
        .catch(() => false);

      const success = await refreshPromise;
      isRefreshing = false;
      refreshPromise = null;

      if (!success) return;

      const repeatRes = await $fetch.raw(context.request, {
        ...context.options,
        onResponse: undefined,
        method: context.options.method as any,
      });
      context.response._data = repeatRes._data;
    },
    ...options,
  };
});
