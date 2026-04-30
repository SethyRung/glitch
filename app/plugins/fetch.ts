import { appendResponseHeader } from "h3";

export default defineNuxtPlugin({
  name: "fetch",
  setup(nuxtApp) {
    const event = useRequestEvent();
    const headers = useRequestHeaders(["cookie"]);

    const fetch = $fetch.create({
      onRequest: (context) => {
        context.options.headers = { ...context.options.headers, ...headers };
      },
      onResponse(context) {
        if (!event) return;
        const cookies = context.response.headers.getSetCookie();
        for (const cookie of cookies) {
          appendResponseHeader(event, "set-cookie", cookie);
        }
      },
    });

    nuxtApp.provide("fetch", fetch);
  },
});
