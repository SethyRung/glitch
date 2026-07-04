import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2026-03-01",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],

  modules: ["@nuxt/ui", "@nuxthub/core", "@vueuse/nuxt", "@onmax/nuxt-better-auth"],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [],
    },
  },

  runtimeConfig: {
    public: {
      siteUrl: "",
    },
  },

  hub: {
    db: {
      dialect: "postgresql",
      driver: process.env.DATABASE_DRIVER as any,
    },
    kv: true,
  },

  auth: {
    hubSecondaryStorage: true,
  },

  nitro: {
    experimental: {
      tasks: true,
    },
  },

  fonts: {
    families: [
      { name: "Geist", provider: "local" },
      { name: "Geist Mono", provider: "local" },
      { name: "Geist Pixel", provider: "local" },
    ],
  },
});
