<script setup lang="ts">
import type { StatsResponse } from "~/types";
import { useLanguage } from "~/composables/useLanguage";

interface LatestDrawResponse {
  data: {
    draw_date: string;
    first: string;
    last2: string;
    last3f: string;
    last3b: string;
  } | null;
}

const route = useRoute();
const { locale, t, toggleLocale, initLocale } = useLanguage();

const navItems = computed(() => [
  { path: "/", label: t("nav.recommend"), icon: "🎯" },
  { path: "/2digit", label: t("nav.2digit"), icon: "🔢" },
  { path: "/3digit", label: t("nav.3digit"), icon: "🎲" },
  { path: "/stat-bar", label: t("nav.statBar"), icon: "📊" },
  { path: "/archive", label: t("nav.archive"), icon: "📅" },
]);

const currentPage = computed(() => {
  const titles: Record<string, { title: string; sub: string }> = {
    "/": { title: t("title.recommend"), sub: t("sub.recommend") },
    "/2digit": { title: t("title.2digit"), sub: t("sub.2digit") },
    "/3digit": { title: t("title.3digit"), sub: t("sub.3digit") },
    "/stat-bar": { title: t("title.statBar"), sub: t("sub.statBar") },
    "/archive": { title: t("title.archive"), sub: t("sub.archive") },
  };
  return titles[route.path] ?? { title: "Lotty", sub: "" };
});

// Fetch stats for gap display
const { data: stats2d } = await useFetch<StatsResponse>("/api/stats/2digit", {
  query: { scope: "all", type: "last2" }
});

const { data: stats3b } = await useFetch<StatsResponse>("/api/stats/3digit", {
  query: { scope: "all", type: "last3b" }
});

const { data: stats3f } = await useFetch<StatsResponse>("/api/stats/3digit", {
  query: { scope: "all", type: "last3f" }
});

// Fetch latest draw for Quick Stats
const { data: latestDraw } = await useFetch<LatestDrawResponse>("/api/latest-draw");

// Helper to get gap for a specific number
const getGapForNumber = (number: string, stats: any) => {
  if (!stats?.data?.ranking) return 0;
  const found = stats.data.ranking.find((r: any) => r.number === number);
  return found?.gap ?? 0;
};

// Helper to get gap class
const getGapClass = (gap: number) => {
  if (gap >= 10) return "gap-hot";
  if (gap >= 5) return "gap-warm";
  return "gap-normal";
};

// Computed gaps for latest draw
const latestGaps = computed(() => {
  if (!latestDraw.value?.data) return null;
  return {
    last2: getGapForNumber(latestDraw.value.data.last2, stats2d.value),
    last3b: getGapForNumber(latestDraw.value.data.last3b, stats3b.value),
    last3f: getGapForNumber(latestDraw.value.data.last3f, stats3f.value),
  };
});

// Generate random lucky numbers
const luckyNumbers = ref<string[]>([]);

const generateLuckyNumbers = () => {
  const nums: string[] = [];
  for (let i = 0; i < 3; i++) {
    nums.push(Math.floor(Math.random() * 100).toString().padStart(2, '0'));
  }
  luckyNumbers.value = nums;
};

// Generate on mount
const isDark = ref(false);

const toggleDarkMode = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
};

onMounted(() => {
  generateLuckyNumbers();
  initLocale();
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    isDark.value = true;
    document.documentElement.classList.add("dark");
  } else {
    isDark.value = false;
    document.documentElement.classList.remove("dark");
  }
});

</script>

<template>
  <div class="layout-shell">
    <div class="layout">
      <nav class="sidebar" aria-label="Main navigation">
        <div class="sidebar-logo" aria-label="Lotty">
          <span class="sidebar-logo-icon">L</span>
        </div>
        <ul class="sidebar-list">
          <li v-for="item in navItems" :key="item.path">
            <NuxtLink
              :to="item.path"
              class="sidebar-link focus-ring"
              :class="{ 'sidebar-link-active': route.path === item.path }"
              :aria-current="route.path === item.path ? 'page' : undefined"
              :title="item.label"
            >
              <span class="sidebar-icon">{{ item.icon }}</span>
              <span class="sidebar-label">{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="layout-body">
        <header class="topbar">
          <div class="topbar-title">
            <h1 class="topbar-page-title">{{ currentPage.title }}</h1>
            <p class="topbar-page-sub">{{ currentPage.sub }}</p>
          </div>
          <div class="topbar-right">
            <button @click="toggleLocale" class="btn-lang-toggle" :aria-label="locale === 'en' ? 'เปลี่ยนเป็นภาษาไทย' : 'Switch to English'">
              {{ locale === 'en' ? 'TH' : 'EN' }}
            </button>
            <button @click="toggleDarkMode" class="btn-theme-toggle" :aria-label="isDark ? 'Switch to light mode' : 'Toggle dark mode'">
              {{ isDark ? '🌙' : '☀️' }}
            </button>
            <span class="topbar-badge">
              <span class="topbar-badge-text">Lotty</span>
            </span>
          </div>
        </header>

        <main class="layout-main">
          <slot />
        </main>
      </div>

      <aside class="panel" aria-label="Quick stats panel">
        <!-- Latest Draw -->
        <section v-if="latestDraw?.data" class="panel-section">
          <div class="panel-section-header">
            <h2 class="panel-section-title">Latest Draw</h2>
          </div>
          <div class="panel-stat-list">
            <div class="panel-stat-card">
              <div class="panel-stat-icon panel-stat-icon--primary">2</div>
              <div class="panel-stat-info">
                <span class="panel-stat-value">{{ latestDraw.data.last2 }}</span>
                <span class="panel-stat-label">2 Digit</span>
              </div>
              <span v-if="latestGaps && latestGaps.last2 > 0" class="ticket-gap num-mono" :class="getGapClass(latestGaps.last2)">
                {{ latestGaps.last2 === 999 ? "Never" : `${latestGaps.last2} draws` }}
              </span>
            </div>
            <div class="panel-stat-card">
              <div class="panel-stat-icon panel-stat-icon--gold">3</div>
              <div class="panel-stat-info">
                <span class="panel-stat-value">{{ latestDraw.data.last3b }}</span>
                <span class="panel-stat-label">3 Digit Top</span>
              </div>
              <span v-if="latestGaps && latestGaps.last3b > 0" class="ticket-gap num-mono" :class="getGapClass(latestGaps.last3b)">
                {{ latestGaps.last3b === 999 ? "Never" : `${latestGaps.last3b} draws` }}
              </span>
            </div>
            <div class="panel-stat-card">
              <div class="panel-stat-icon panel-stat-icon--info">3</div>
              <div class="panel-stat-info">
                <span class="panel-stat-value">{{ latestDraw.data.last3f }}</span>
                <span class="panel-stat-label">3 Digit Bottom</span>
              </div>
              <span v-if="latestGaps && latestGaps.last3f > 0" class="ticket-gap num-mono" :class="getGapClass(latestGaps.last3f)">
                {{ latestGaps.last3f === 999 ? "Never" : `${latestGaps.last3f} draws` }}
              </span>
            </div>
          </div>
        </section>

        <!-- Lucky Numbers -->
        <section class="panel-section">
          <div class="panel-section-header">
            <h2 class="panel-section-title">Lucky Numbers</h2>
            <button @click="generateLuckyNumbers" class="panel-section-link focus-ring">REFRESH</button>
          </div>
          <div class="panel-lucky-grid">
            <span v-for="num in luckyNumbers" :key="num" class="panel-lucky-badge">{{ num }}</span>
          </div>
        </section>

        <!-- Footer -->
        <div class="panel-footer">
          <span class="panel-footer-text">Lotty v1.0 • © 2025</span>
        </div>
      </aside>

      <nav class="nav-mobile" aria-label="Mobile navigation">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-mobile-item focus-ring"
          :class="{ 'nav-mobile-item-active': route.path === item.path }"
          :aria-label="item.label"
          :aria-current="route.path === item.path ? 'page' : undefined"
        >
          <span class="nav-mobile-icon">{{ item.icon }}</span>
          <span class="nav-mobile-label">{{ item.label }}</span>
        </NuxtLink>
      </nav>
    </div>
  </div>
</template>

<style scoped>
/* ---- Shell — gradient blur background behind rounded container ---- */
.layout-shell {
  min-height: 100dvh;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

/* ---- Root container — rounded white card ---- */
.layout {
  display: flex;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  background: var(--bg-surface);
}

/* ---- Sidebar / Panel hidden on mobile ---- */
.sidebar,
.panel {
  display: none;
}

/* ---- Body (topbar + content) ---- */
.layout-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

/* ---- Topbar ---- */
.topbar {
  flex-shrink: 0;
  min-height: var(--topbar-height);
  background: var(--bg-surface);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--gap-sm) clamp(var(--gap-md), 4vw, var(--gap-lg));
  gap: var(--gap-md);
}

.topbar-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.topbar-page-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  line-height: 1.2;
}

.topbar-page-sub {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
}

.btn-lang-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--bg-raised);
  border: 1px solid var(--border);
  cursor: pointer;
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  color: var(--text-secondary);
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    transform var(--transition-fast);
}

.btn-lang-toggle:hover {
  background: var(--bg-hover);
  border-color: var(--accent);
  transform: scale(1.05);
}

.btn-theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--bg-raised);
  border: 1px solid var(--border);
  cursor: pointer;
  font-size: var(--text-md);
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    transform var(--transition-fast);
}

.btn-theme-toggle:hover {
  background: var(--bg-hover);
  border-color: var(--accent);
  transform: scale(1.05);
}

.topbar-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--accent);
  background: var(--accent-light);
  padding: var(--gap-xs) var(--gap-md);
  border-radius: var(--radius-full);
}

.topbar-badge-text {
  white-space: nowrap;
}

@media (max-width: 480px) {
  .topbar-badge-text {
    display: none;
  }
}

/* ---- Main content ---- */
.layout-main {
  flex: 1;
  overflow-y: auto;
  padding: clamp(12px, 3vw, var(--gap-lg));
  scroll-behavior: smooth;
  background: var(--bg-raised);
}

/* ---- Mobile bottom nav ---- */
.nav-mobile {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  min-height: var(--nav-height-mobile);
  background: var(--bg-surface);
  border-top: 1px solid var(--border);
  box-shadow: 0 -2px 12px rgba(26, 26, 46, 0.06);
  display: flex;
  align-items: stretch;
  z-index: 100;
  padding: var(--gap-xs) 0;
}

.nav-mobile-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: var(--text-muted);
  transition: color var(--transition-fast);
}

.nav-mobile-item-active {
  color: var(--accent);
  font-weight: var(--weight-bold);
}

.nav-mobile-icon {
  font-size: var(--text-md);
  line-height: 1;
}

.nav-mobile-label {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
}

/* ---- Desktop ---- */
@media (min-width: 1024px) {


  /* ---- Sidebar with labels (~220px) ---- */
  .sidebar {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    flex-shrink: 0;
    width: var(--sidebar-width);
    background: var(--bg-sidebar);
    border-right: 1px solid var(--border);
    padding: var(--gap-md) var(--gap-md);
    gap: var(--gap-lg);
  }

  .sidebar-logo {
    width: var(--logo-size);
    height: var(--logo-size);
    background: linear-gradient(135deg, var(--accent), var(--accent-hover));
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 10px rgba(108, 92, 231, 0.35);
  }

  .sidebar-logo-icon {
    font-size: var(--text-md);
    color: var(--color-white);
    line-height: 1;
    font-weight: var(--weight-bold);
  }

  .sidebar-list {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
    width: 100%;
    list-style: none;
  }

  .sidebar-link {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: var(--gap-sm);
    padding: var(--gap-sm) var(--gap-md);
    height: var(--nav-link-height);
    border-radius: var(--radius-sm);
    color: var(--sidebar-text);
    transition:
      background var(--transition-fast),
      color var(--transition-fast);
  }

  .sidebar-icon {
    font-size: var(--text-lg);
    line-height: 1;
    flex-shrink: 0;
  }

  .sidebar-label {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: inherit;
  }

  .sidebar-link:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .sidebar-link-active {
    background: var(--sidebar-active-bg);
    color: var(--sidebar-active);
  }

  .sidebar-link-active::before {
    content: "";
    position: absolute;
    left: calc(var(--gap-md) * -1);
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 24px;
    border-radius: var(--radius-full);
    background: var(--accent);
  }

  /* ---- Right Panel ---- */
  .panel {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    width: var(--panel-width);
    background: var(--bg-surface);
    border-left: 1px solid var(--border);
    padding: var(--gap-lg) var(--gap-md);
    gap: var(--gap-lg);
    overflow-y: auto;
  }

  .panel-section {
    display: flex;
    flex-direction: column;
    gap: var(--gap-md);
  }

  .panel-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .panel-section-title {
    font-family: var(--font-display);
    font-size: var(--text-md);
    font-weight: var(--weight-semibold);
    color: var(--text-primary);
  }

  .panel-section-link {
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--text-muted);
    letter-spacing: 0.5px;
    text-transform: uppercase;
    transition: color var(--transition-fast);
  }

  .panel-section-link:hover {
    color: var(--accent);
  }

  /* ---- Stat cards (ListItemRow pattern) ---- */
  .panel-stat-list {
    display: flex;
    flex-direction: column;
    gap: var(--gap-sm);
  }

  .panel-stat-card {
    display: flex;
    align-items: center;
    gap: var(--gap-sm);
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: var(--gap-sm) var(--gap-md);
  }

  .panel-stat-icon {
    width: var(--stat-icon-size);
    height: var(--stat-icon-size);
    border-radius: var(--radius-xs);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-sm);
    font-weight: var(--weight-bold);
    flex-shrink: 0;
  }

  .panel-stat-icon--primary {
    background: var(--accent-light);
    color: var(--accent);
  }

  .panel-stat-icon--gold {
    background: var(--accent-gold-light);
    color: var(--accent-gold);
  }

  .panel-stat-icon--info {
    background: var(--accent-info-light);
    color: var(--accent-info);
  }

  .panel-stat-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .panel-stat-value {
    font-family: var(--font-mono);
    font-size: var(--text-md);
    font-weight: var(--weight-bold);
    color: var(--text-primary);
    letter-spacing: 1px;
  }

  .panel-stat-label {
    font-size: var(--text-xs);
    color: var(--text-muted);
  }

  /* ---- Lucky numbers (Members grid pattern) ---- */
  .panel-lucky-grid {
    display: flex;
    gap: var(--gap-sm);
    flex-wrap: wrap;
  }

  .panel-lucky-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--lucky-badge-size);
    height: var(--lucky-badge-size);
    background: var(--accent-light);
    color: var(--accent);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: var(--weight-bold);
    border-radius: var(--radius-full);
  }

  /* ---- Panel Footer ---- */
  .panel-footer {
    margin-top: auto;
    padding-top: var(--gap-md);
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
  }

  .panel-footer-text {
    font-size: var(--text-xs);
    color: var(--text-muted);
  }

  .nav-mobile {
    display: none;
  }

  .layout-main {
    padding: var(--gap-lg);
  }
}
</style>
