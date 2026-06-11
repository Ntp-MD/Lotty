<script setup lang="ts">
import type { StatsResponse } from "~/types";

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

const navItems = [
  { path: "/", label: "Recommend", icon: "🎯" },
  { path: "/2digit", label: "2 Digit", icon: "🔢" },
  { path: "/3digit", label: "3 Digit", icon: "🎲" },
  { path: "/stat-bar", label: "Stat Graph", icon: "📊" },
  { path: "/archive", label: "Archive", icon: "📅" },
];

const pageTitles: Record<string, { title: string; sub: string }> = {
  "/": { title: "Recommended Numbers", sub: "Longest gap + Quick Pick" },
  "/2digit": { title: "2 Digit", sub: "Statistics for last 2 digits" },
  "/3digit": { title: "3 Digit", sub: "Statistics for 3 digits (top/front/bottom)" },
  "/stat-bar": { title: "Stat Bar", sub: "Digit breakdown graph 2/3/6 digits" },
  "/archive": { title: "Archive", sub: "Historical lottery results" },
};

const currentPage = computed(() => pageTitles[route.path] ?? { title: "Lotty", sub: "" });

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
onMounted(() => {
  generateLuckyNumbers();
});

</script>

<template>
  <div class="layout">
    <nav class="sidebar" aria-label="Main navigation">
      <div class="sidebar-logo-wrap" aria-label="Lotty">
        <div class="sidebar-logo">
          <span class="sidebar-logo-icon">L</span>
        </div>
        <span class="sidebar-logo-name">Lotty</span>
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

      <!-- Quick Stats Card -->
      <div v-if="latestDraw?.data" class="sidebar-card sidebar-card--gradient">
        <div class="sidebar-card-header">
          <span class="sidebar-card-icon">📰</span>
          <span class="sidebar-card-title">Latest Draw</span>
        </div>
        <div class="sidebar-card-content">
          <div class="sidebar-stat-row">
            <span class="stat-label">2 Digit</span>
            <span class="sidebar-stat-value">{{ latestDraw.data.last2 }}</span>
            <span v-if="latestGaps && latestGaps.last2 > 0" class="ticket-gap num-mono" :class="getGapClass(latestGaps.last2)">
              {{ latestGaps.last2 === 999 ? "Never" : `${latestGaps.last2} draws` }}
            </span>
          </div>
          <div class="sidebar-stat-row">
            <span class="stat-label">3 Digit Top</span>
            <span class="sidebar-stat-value">{{ latestDraw.data.last3b }}</span>
            <span v-if="latestGaps && latestGaps.last3b > 0" class="ticket-gap num-mono" :class="getGapClass(latestGaps.last3b)">
              {{ latestGaps.last3b === 999 ? "Never" : `${latestGaps.last3b} draws` }}
            </span>
          </div>
          <div class="sidebar-stat-row">
            <span class="stat-label">3 Digit Bottom</span>
            <span class="sidebar-stat-value">{{ latestDraw.data.last3f }}</span>
            <span v-if="latestGaps && latestGaps.last3f > 0" class="ticket-gap num-mono" :class="getGapClass(latestGaps.last3f)">
              {{ latestGaps.last3f === 999 ? "Never" : `${latestGaps.last3f} draws` }}
            </span>
          </div>
        </div>
      </div>

      <!-- Lucky Numbers Card -->
      <div class="sidebar-card">
        <div class="sidebar-card-header">
          <span class="sidebar-card-icon">🍀</span>
          <span class="sidebar-card-title">Lucky Numbers</span>
        </div>
        <div class="sidebar-card-content">
          <div class="sidebar-lucky-numbers">
            <span v-for="num in luckyNumbers" :key="num" class="sidebar-lucky-badge">{{ num }}</span>
          </div>
          <button @click="generateLuckyNumbers" class="btn btn-ghost btn-sm">
            <span>🔄</span>
            <span>Randomize</span>
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="sidebar-footer">
        <span class="sidebar-footer-text">Lotty v1.0 • © 2025</span>
      </div>
    </nav>

    <div class="layout-body">
      <header class="topbar">
        <div class="topbar-title">
          <h1 class="topbar-page-title">{{ currentPage.title }}</h1>
          <p class="topbar-page-sub">{{ currentPage.sub }}</p>
        </div>
        <div class="topbar-right">
          <span class="topbar-badge">
            <span class="topbar-badge-text">Lotty</span>
          </span>
        </div>
      </header>

      <main class="layout-main">
        <slot />
      </main>
    </div>

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
        <span class="nav-mobile-label">{{ item.label }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<style scoped>
/* ---- Root ---- */
.layout {
  display: flex;
  height: 100dvh;
  overflow: hidden;
  background: var(--bg-base);
}

/* ---- Sidebar hidden on mobile ---- */
.sidebar {
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
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--gap-xs) clamp(var(--gap-sm), 4vw, var(--gap-lg));
  gap: var(--gap-md);
}

.topbar-title {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.topbar-page-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  line-height: 1;
}

.topbar-page-sub {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
}

.topbar-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--accent);
  background: var(--accent-light);
  padding: 4px var(--gap-sm);
  border-radius: var(--radius-full);
  border: 1px solid var(--accent);
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
  padding: clamp(12px, 3vw, var(--gap-md));
  scroll-behavior: smooth;
}

/* ---- Mobile bottom nav ---- */
.nav-mobile {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  min-height: 60px;
  background: var(--bg-surface);
  border-top: 1px solid var(--border);
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: stretch;
  z-index: 100;
  padding: 4px 0;
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

.nav-mobile-label {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
}

/* ---- Desktop ---- */
@media (min-width: 1024px) {
  .sidebar {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    flex-shrink: 0;
    width: auto;
    min-width: 250px;
    height: 100dvh;
    background: var(--bg-sidebar);
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    padding: var(--gap-sm);
    gap: var(--gap-sm);
    /* Dark context — override tokens for all children */
    --bg-surface: #253347;
    --bg-raised: rgba(255, 255, 255, 0.05);
    --bg-hover: rgba(255, 255, 255, 0.08);
    --border: rgba(255, 255, 255, 0.1);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent-light: rgba(59, 130, 246, 0.18);
  }

  .sidebar-logo-wrap {
    display: flex;
    align-items: center;
    gap: var(--gap-sm);
    flex-shrink: 0;
    padding: var(--gap-xs) 0;
  }

  .sidebar-logo {
    width: 36px;
    height: 36px;
    background: var(--accent);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .sidebar-logo-icon {
    font-size: var(--text-md);
    color: #fff;
    line-height: 1;
    font-weight: var(--weight-bold);
  }

  .sidebar-logo-name {
    font-size: var(--text-lg);
    font-weight: var(--weight-bold);
    color: #e2e8f0;
    letter-spacing: -0.3px;
  }

  .sidebar-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    list-style: none;
  }

  .sidebar-link {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: var(--gap-sm) var(--gap-md);
    height: 44px;
    border-radius: var(--radius-md);
    color: #94a3b8;
    transition:
      background var(--transition-fast),
      color var(--transition-fast),
      transform var(--transition-fast);
    gap: var(--gap-sm);
  }

  .sidebar-icon {
    font-size: var(--text-lg);
    line-height: 1;
    flex-shrink: 0;
  }

  .sidebar-link:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #e2e8f0;
    transform: translateX(2px);
  }

  .sidebar-link-active {
    background: rgba(59, 130, 246, 0.18);
    color: #60a5fa;
    border: none;
    border-left: 3px solid var(--accent);
    font-weight: var(--weight-bold);
  }

  .sidebar-label {
    font-size: var(--text-md);
    font-weight: var(--weight-medium);
    color: inherit;
  }

  /* ---- Sidebar Cards ---- */
  .sidebar-card {
    background: #253347;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-md);
    padding: var(--gap-md);
  }

  .sidebar-card--gradient {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, #253347 100%);
    border-color: rgba(59, 130, 246, 0.3);
  }

  .sidebar-card-header {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
    margin-bottom: var(--gap-sm);
  }

  .sidebar-card-icon {
    font-size: var(--text-md);
    line-height: 1;
  }

  .sidebar-card-title {
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    color: #e2e8f0;
  }

  .sidebar-card-content {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
  }

  .sidebar-stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
    gap: var(--gap-xs);
  }

  .sidebar-stat-value {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: var(--weight-bold);
    color: #60a5fa;
  }

  .sidebar-lucky-numbers {
    display: flex;
    gap: var(--gap-xs);
    flex-wrap: wrap;
  }

  .sidebar-lucky-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 32px;
    padding: 0 var(--gap-sm);
    background: rgba(59, 130, 246, 0.18);
    color: #60a5fa;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: var(--weight-bold);
    border-radius: var(--radius-sm);
    border: 1px solid rgba(59, 130, 246, 0.3);
  }

  /* ---- Sidebar Footer ---- */
  .sidebar-footer {
    padding-top: var(--gap-sm);
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
		margin-top: auto;
  }

  .sidebar-footer-text {
    font-size: var(--text-xs);
    color: var(--text-muted);
  }

  .nav-mobile {
    display: none;
  }

  .layout-main {
    padding: var(--gap-lg);
    margin-bottom: 40px;
  }
}
</style>
