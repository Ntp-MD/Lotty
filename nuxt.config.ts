export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ["@nuxtjs/supabase"],

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
    redirectOptions: {
      login: "/",
      callback: "/",
      exclude: ["/*"],
    },
  },

  css: ["~/assets/style/main.css"],

  app: {
    head: {
      title: "Lotty",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "Advanced lottery analytics platform with real-time data insights" },
      ],
      link: [
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sarabun:wght@400;500;700&family=JetBrains+Mono:wght@400;600&display=swap",
        },
      ],
    },
  },

  routeRules: {
    "/api/stats/**": { cache: { maxAge: 3600 } },
    "/api/advisor": { cache: { maxAge: 3600 } },
    "/api/cron/**": { cache: false },
    "/api/health": { cache: false },
  },

  runtimeConfig: {
    cronSecret: process.env.CRON_SECRET ?? "",
    public: {
      supabaseUrl: process.env.SUPABASE_URL ?? "",
      supabaseKey: process.env.SUPABASE_ANON_KEY ?? "",
    },
  },

  typescript: {
    strict: true,
  },

  compatibilityDate: "2024-07-30",
});
