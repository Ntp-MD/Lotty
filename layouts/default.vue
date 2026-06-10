<script setup lang="ts">
import type { StatsResponse } from "~/types";

const route = useRoute();

const navItems = [
  { path: "/", label: "แนะนำ" },
  { path: "/2digit", label: "เลข 2 ตัว" },
  { path: "/3digit", label: "เลข 3 ตัว" },
  { path: "/stat-bar", label: "สถิติกราฟ" },
  { path: "/archive", label: "ผลย้อนหลัง" },
];

const pageTitles: Record<string, { title: string; sub: string }> = {
  "/": { title: "เลขแนะนำ", sub: "เลขค้างนาน + Quick Pick" },
  "/2digit": { title: "2 ตัว", sub: "สถิติเลขท้าย 2 ตัว" },
  "/3digit": { title: "3 ตัว", sub: "สถิติเลข 3 ตัวบน/หน้า/ล่าง" },
  "/stat-bar": { title: "Stat Bar", sub: "กราฟแยกหลัก 2/3/6 ตัว" },
  "/archive": { title: "ผลย้อนหลัง", sub: "ผลการออกรางวัลทุกงวด" },
};

const currentPage = computed(() => pageTitles[route.path] ?? { title: "Lotty", sub: "" });

// Fetch all-time digit frequency data
const { data: stats2d } = await useFetch<StatsResponse>("/api/stats/2digit", {
  query: { scope: "all", type: "last2" }
});

const { data: stats3b } = await useFetch<StatsResponse>("/api/stats/3digit", {
  query: { scope: "all", type: "last3b" }
});

const { data: stats3f } = await useFetch<StatsResponse>("/api/stats/3digit", {
  query: { scope: "all", type: "last3f" }
});

const { data: stats6d } = await useFetch<StatsResponse>("/api/stats/digits", {
  query: { scope: "all" }
});

const digitFrequency = computed(() => {
  const freq: Record<string, number> = {};

  if (stats2d.value?.data.ranking) {
    stats2d.value.data.ranking.forEach((r) => {
      r.number.split('').forEach((d) => {
        freq[d] = (freq[d] ?? 0) + r.count;
      });
    });
  }

  if (stats3b.value?.data.ranking) {
    stats3b.value.data.ranking.forEach((r) => {
      r.number.split('').forEach((d) => {
        freq[d] = (freq[d] ?? 0) + r.count;
      });
    });
  }

  if (stats3f.value?.data.ranking) {
    stats3f.value.data.ranking.forEach((r) => {
      r.number.split('').forEach((d) => {
        freq[d] = (freq[d] ?? 0) + r.count;
      });
    });
  }

  if (stats6d.value?.data.ranking) {
    stats6d.value.data.ranking.forEach((r) => {
      r.number.split('').forEach((d) => {
        freq[d] = (freq[d] ?? 0) + r.count;
      });
    });
  }

  return freq;
});

const sortedDigits = computed(() => {
  const total = Object.values(digitFrequency.value).reduce((a, b) => a + b, 0);
  const maxCount = Math.max(...Object.values(digitFrequency.value), 1);
  return Array.from({ length: 10 }, (_, i) => {
    const count = digitFrequency.value[String(i)] ?? 0;
    return {
      digit: String(i),
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      barWidth: maxCount > 0 ? (count / maxCount) * 100 : 0
    };
  });
});
</script>

<template>
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
            <span class="sidebar-label">{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>

      <div v-if="sortedDigits.length" class="sidebar-chart">
        <div class="sidebar-chart-title">เลขที่ออกบ่อย (All Time)</div>
        <div class="sidebar-chart-bars">
          <div v-for="item in sortedDigits" :key="item.digit" class="sidebar-chart-row">
            <span class="sidebar-chart-label">{{ item.digit }}</span>
            <div class="sidebar-chart-track">
              <div
                class="sidebar-chart-fill"
                :style="{ width: `${item.barWidth}%` }"
              ></div>
            </div>
            <span class="sidebar-chart-count">{{ item.count }}</span>
          </div>
        </div>
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

.topbar-badge-icon {
  font-size: var(--text-sm);
  line-height: 1;
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
    min-width: 200px;
    height: 100dvh;
    background: var(--bg-sidebar);
    border-right: 1px solid var(--border);
    padding: var(--gap-md);
    gap: var(--gap-md);
  }

  .sidebar-logo {
    width: 40px;
    height: 40px;
    background: var(--accent);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .sidebar-logo-icon {
    font-size: var(--text-lg);
    color: #fff;
    line-height: 1;
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
    color: var(--sidebar-text);
    transition:
      background var(--transition-fast),
      color var(--transition-fast),
      transform var(--transition-fast);
  }

  .sidebar-link:hover {
    background: var(--sidebar-active-bg);
    color: var(--sidebar-active);
    transform: translateX(2px);
  }

  .sidebar-link-active {
    background: var(--accent-light);
    color: var(--accent);
    border: 2px solid var(--accent);
    font-weight: var(--weight-bold);
  }

  .sidebar-label {
    font-size: var(--text-md);
    font-weight: var(--weight-medium);
    color: var(--text-primary);
  }

  .sidebar-chart {
    margin-top: var(--gap-md);
    padding-top: var(--gap-md);
    border-top: 1px solid var(--border);
  }

  .sidebar-chart-title {
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
    color: var(--text-secondary);
    margin-bottom: var(--gap-sm);
  }

  .sidebar-chart-bars {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .sidebar-chart-row {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
  }

  .sidebar-chart-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: var(--weight-bold);
    color: var(--text-primary);
    width: 16px;
    text-align: center;
    flex-shrink: 0;
  }

  .sidebar-chart-track {
    flex: 1;
    height: 8px;
    background: var(--bg-base);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }

  .sidebar-chart-fill {
    height: 100%;
    background: var(--accent);
    border-radius: var(--radius-sm);
    transition: width 0.3s ease;
  }

  .sidebar-chart-count {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    width: 24px;
    text-align: right;
    flex-shrink: 0;
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
