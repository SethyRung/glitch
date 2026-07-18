import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2026-03-01",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],

  modules: ["@nuxt/ui", "@nuxthub/core", "@vueuse/nuxt", "@onmax/nuxt-better-auth"],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["better-auth/client/plugins"],
    },
  },

  runtimeConfig: {
    bridgeSharedSecret: "",
    public: {
      siteUrl: "",
      enableVConsole: "",
    },
  },

  hub: {
    db: {
      dialect: "postgresql",
      driver: process.env.DATABASE_DRIVER as any,
      casing: "snake_case",
    },
    kv: true,
  },

  auth: {
    hubSecondaryStorage: true,
    schema: {
      casing: "snake_case",
    },
    redirects: {
      login: "/login",
      guest: "/",
      authenticated: "/",
      logout: "/login",
    },
    preserveRedirect: true,
  },

  routeRules: {
    "/admin/**": { auth: { user: { role: "admin" } } },
    "/account/**": { auth: "user" },
    "/library/**": { auth: "user" },
    "/cart": { auth: "user" },
    "/checkout/**": { auth: "user" },
    "/login": { auth: "guest" },
    "/register": { auth: "guest" },
    "/forgot-password": { auth: "guest" },
    "/reset-password": { auth: "guest" },
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
