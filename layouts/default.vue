<script setup lang="ts">
import type { StatsResponse } from "~/types";

const route = useRoute();

const navItems = [
  { path: "/", label: "แนะนำ", icon: "หน้าหลัก" },
  { path: "/2digit", label: "2 ตัว", icon: "เลข 2 หลัก" },
  { path: "/3digit", label: "3 ตัว", icon: "เลข 3 หลัก" },
  { path: "/archive", label: "ย้อนหลัง", icon: "" },
];

const pageTitles: Record<string, { title: string; sub: string }> = {
  "/": { title: "เลขแนะนำ", sub: "เลขค้างนาน + Quick Pick" },
  "/2digit": { title: "2 ตัว", sub: "สถิติเลขท้าย 2 ตัว" },
  "/3digit": { title: "3 ตัว", sub: "สถิติเลข 3 ตัวบน/หน้า/ล่าง" },
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
  <div class="layout-wrapper">
    <div class="layout-container">

      <!-- ── Sidebar ── -->
      <aside class="layout-menu" aria-label="Main navigation">
        <!-- Brand -->
        <div class="menu-brand">
          <NuxtLink to="/" class="menu-brand-link">
            <span class="menu-brand-logo">L</span>
            <span class="menu-brand-text">Lotty</span>
          </NuxtLink>
        </div>

        <div class="menu-divider"></div>

        <!-- Nav -->
        <ul class="menu-inner" role="list">
          <li class="menu-section-label">สถิติลอตเตอรี</li>
          <li v-for="item in navItems" :key="item.path" class="menu-item">
            <NuxtLink
              :to="item.path"
              class="menu-link focus-ring"
              :class="{ 'menu-link-active': route.path === item.path }"
              :aria-current="route.path === item.path ? 'page' : undefined"
            >
              <span class="menu-icon" aria-hidden="true">{{ item.icon }}</span>
              <span class="menu-label">{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </aside>
      <!-- /Sidebar -->

      <!-- ── Layout Page ── -->
      <div class="layout-page">

        <!-- Topbar -->
        <nav class="layout-navbar" aria-label="Top navigation">
          <!-- mobile hamburger -->
          <button class="navbar-menu-toggle" aria-label="Toggle menu">☰</button>

          <div class="navbar-left">
            <h1 class="navbar-page-title">{{ currentPage.title }}</h1>
            <p class="navbar-page-sub">{{ currentPage.sub }}</p>
          </div>

          <div class="navbar-right">
            <span class="navbar-badge">Lotty</span>
          </div>
        </nav>
        <!-- /Topbar -->

        <!-- Content -->
        <div class="content-wrapper">
          <div class="content-body">
            <slot />
          </div>
        </div>
        <!-- /Content -->

      </div>
      <!-- /Layout Page -->

    </div>

    <!-- Mobile bottom nav -->
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
        <span class="nav-mobile-icon" aria-hidden="true">{{ item.icon }}</span>
        <span class="nav-mobile-label">{{ item.label }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<style scoped>
/* ── Root ── */
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: var(--bg-base);
}

/* ── Inner container (sidebar + page) ── */
.layout-container {
  display: flex;
  flex: 1;
  min-height: 100dvh;
}

/* ── Sidebar hidden on mobile ── */
.layout-menu {
  display: none;
}

/* ── Layout Page ── */
.layout-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  min-height: 100dvh;
}

/* ── Topbar ── */
.layout-navbar {
  position: sticky;
  top: 0;
  z-index: 10;
  min-height: var(--topbar-height);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: var(--gap-md);
  padding: 0 clamp(var(--gap-sm), 4vw, var(--gap-lg));
}

.navbar-menu-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: var(--text-lg);
}

.navbar-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.navbar-page-title {
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  line-height: 1;
}

.navbar-page-sub {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
}

.navbar-badge {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--accent);
  background: var(--accent-light);
  padding: 4px var(--gap-sm);
  border-radius: var(--radius-full);
}

/* ── Content ── */
.content-wrapper {
  flex: 1;
  overflow-y: auto;
}

.content-body {
  width: 100%;
  padding: clamp(var(--gap-md), 3vw, var(--gap-lg));
  padding-bottom: calc(var(--nav-height-mobile) + var(--gap-lg));
  max-width: var(--content-max-width);
}

/* ── Mobile Bottom Nav ── */
.nav-mobile {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  min-height: var(--nav-height-mobile);
  background: var(--bg-surface);
  border-top: 1px solid var(--border);
  box-shadow: 0 -2px 8px rgba(34, 48, 62, 0.08);
  display: flex;
  align-items: stretch;
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
}

.nav-mobile-icon {
  font-size: var(--text-md);
  font-weight: var(--weight-bold);
  line-height: 1;
}

.nav-mobile-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
}

/* ── Desktop ── */
@media (min-width: 960px) {
  .layout-wrapper {
    flex-direction: row;
  }

  .layout-menu {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    flex-shrink: 0;
    width: auto;
    min-width: 200px;
    height: 100dvh;
    position: sticky;
    top: 0;
    background: var(--bg-sidebar);
    border-right: 1px solid var(--border);
    overflow-y: auto;
    padding-bottom: var(--gap-lg);
  }

  /* Brand */
  .menu-brand {
    padding: var(--gap-md) var(--gap-md);
    min-height: var(--topbar-height);
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--border);
  }

  .menu-brand-link {
    display: flex;
    align-items: center;
    gap: var(--gap-sm);
    text-decoration: none;
  }

  .menu-brand-logo {
    width: 34px;
    height: 34px;
    background: var(--accent);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-size: var(--text-md);
    font-weight: var(--weight-bold);
    flex-shrink: 0;
  }

  .menu-brand-text {
    font-size: var(--text-lg);
    font-weight: var(--weight-bold);
    color: var(--text-primary);
    letter-spacing: -0.3px;
  }

  .menu-divider {
    height: 1px;
    background: var(--border);
    margin: 0;
  }

  /* Nav list */
  .menu-inner {
    list-style: none;
    padding: var(--gap-sm) 0;
    flex: 1;
  }

  .menu-section-label {
    padding: var(--gap-sm) var(--gap-md) 4px;
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }

  .menu-item {
    padding: 2px var(--gap-sm);
  }

  .menu-link {
    display: flex;
    align-items: center;
    gap: var(--gap-sm);
    padding: 10px var(--gap-sm);
    border-radius: var(--radius-sm);
    color: var(--sidebar-text);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    transition: background var(--transition-fast), color var(--transition-fast);
    text-decoration: none;
  }

  .menu-link:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .menu-link-active {
    background: var(--sidebar-active-bg);
    color: var(--sidebar-active);
    font-weight: var(--weight-bold);
  }

  .menu-icon {
    font-size: var(--text-md);
    font-weight: var(--weight-bold);
    line-height: 1;
    width: 22px;
    text-align: center;
    flex-shrink: 0;
  }

  .menu-label {
    flex: 1;
  }

  .navbar-menu-toggle {
    display: none;
  }

  .nav-mobile {
    display: none;
  }

  .content-body {
    padding: clamp(var(--gap-md), 3vw, var(--gap-lg));
    padding-bottom: clamp(var(--gap-md), 3vw, var(--gap-lg));
  }
}
</style>
