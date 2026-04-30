import { appendResponseHeader } from "h3";

export const useFetchApi = createUseFetch((options) => {
  const event = useRequestEvent();

  return {
    onResponse: async ({ response }) => {
      if (event && response.ok) {
        const cookies = response.headers.getSetCookie() ?? [];
        for (const cookie of cookies) {
          appendResponseHeader(event, "set-cookie", cookie);
        }
      }
    },
    ...options,
  };
});
