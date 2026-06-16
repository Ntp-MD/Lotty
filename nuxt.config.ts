export default defineNuxtConfig({
	devtools: { enabled: process.env.NODE_ENV === 'development' },

	devServer: {
		host: '0.0.0.0',
		port: 3000
	},

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
				{ rel: "preconnect", href: "https://cdn.jsdelivr.net" },
				{
					rel: "preload",
					as: "style",
					href: "https://cdn.jsdelivr.net/gh/lazywasabi/thai-web-fonts@7/fonts/LINESeedSansTH/LINESeedSansTH.css",
				},
				{
					rel: "stylesheet",
					href: "https://cdn.jsdelivr.net/gh/lazywasabi/thai-web-fonts@7/fonts/LINESeedSansTH/LINESeedSansTH.css",
				},
				{ rel: "preconnect", href: "https://fonts.googleapis.com" },
				{ rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
				{
					rel: "preload",
					as: "style",
					href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap",
				},
				{
					rel: "stylesheet",
					href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap",
				},
				{
					rel: "preload",
					as: "fetch",
					href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap",
					crossorigin: "",
				},
			],
		},
	},

	nitro: {
		routeRules: {
			"/**": {
				headers: {
					"X-Frame-Options": "DENY",
					"X-Content-Type-Options": "nosniff",
					"X-XSS-Protection": "1; mode=block",
					"Referrer-Policy": "strict-origin-when-cross-origin",
					"Permissions-Policy": "geolocation=(), microphone=(), camera=()",
				},
			},
		},
	},

	routeRules: {
		"/": { isr: true },
		"/2digit": { isr: true },
		"/3digit": { isr: true },
		"/stat-bar": { isr: true },
		"/archive": { isr: true },
		"/api/stats/**": {
			cache: { maxAge: 3600 },
			cors: true,
		},
		"/api/advisor": {
			cache: { maxAge: 3600 },
			cors: true,
		},
		"/api/latest-draw": {
			cache: { maxAge: 60 },
			cors: true,
		},
		"/api/cron/**": {
			cache: false,
			cors: false,
		},
		"/api/health": {
			cache: false,
			cors: true,
		},
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

	vite: {
		build: {
			cssMinify: 'lightningcss',
		},
	},

	compatibilityDate: "2024-07-30",
});
