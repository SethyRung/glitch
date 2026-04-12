import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: "2026-03-01",
  css: ["~/assets/css/main.css"],
  modules: ["@nuxt/ui", "@nuxthub/core", "@pinia/nuxt", "@vueuse/nuxt"],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    jwt: {
      access: {
        secret: "",
        expiresIn: "",
      },
      refresh: {
        secret: "",
        expiresIn: "",
      },
    },
    public: {
      baseURL: "",
    },
  },
  hub: {
    db: {
      dialect: "postgresql",
      driver: process.env.DATABASE_DRIVER as "postgres-js" | "neon-http",
    },
  },
  nitro: {
    experimental: {
      tasks: true,
    },
  },
});
