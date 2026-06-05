<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();

const navItems = [
  { path: "/", label: "แนะนำ", icon: "✦" },
  { path: "/2digit", label: "2 ตัว", icon: "②" },
  { path: "/3digit", label: "3 ตัว", icon: "③" },
  { path: "/digits", label: "6 หลัก", icon: "⑥" },
  { path: "/archive", label: "ย้อนหลัง", icon: "☰" },
];

const pageTitles: Record<string, { title: string; sub: string }> = {
  "/": { title: "เลขแนะนำ", sub: "เลขค้างนาน + Quick Pick" },
  "/2digit": { title: "2 ตัว", sub: "สถิติเลขท้าย 2 ตัว" },
  "/3digit": { title: "3 ตัว", sub: "สถิติเลข 3 ตัวบน/หน้า/ล่าง" },
  "/digits": { title: "6 หลัก", sub: "วิเคราะห์รายหลักรางวัลที่ 1" },
  "/archive": { title: "ผลย้อนหลัง", sub: "ผลการออกรางวัลทุกงวด" },
};

const currentPage = computed(() => pageTitles[route.path] ?? { title: "LottoLens", sub: "" });
</script>

<template>
  <div class="layout">
    <nav class="sidebar" aria-label="Main navigation">
      <div class="sidebar-logo" aria-label="LottoLens">
        <span class="sidebar-logo-icon">◈</span>
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
            <span class="sidebar-icon" aria-hidden="true">{{ item.icon }}</span>
            <span class="sidebar-tooltip">{{ item.label }}</span>
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
          <span class="topbar-badge">ข้อมูลจริง ไม่ใช่เดา</span>
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
        <span class="nav-mobile-icon" aria-hidden="true">{{ item.icon }}</span>
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
  height: var(--topbar-height);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--gap-lg);
  gap: var(--gap-md);
}

.topbar-title {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.topbar-page-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  line-height: 1;
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

.topbar-badge {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--accent);
  background: var(--accent-light);
  padding: 3px var(--gap-sm);
  border-radius: var(--radius-full);
}

/* ---- Main content ---- */
.layout-main {
  flex: 1;
  overflow-y: auto;
  padding: var(--gap-md);
  padding-bottom: calc(var(--nav-height-mobile) + var(--gap-lg));
  scroll-behavior: smooth;
}

/* ---- Mobile bottom nav ---- */
.nav-mobile {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--nav-height-mobile);
  background: var(--bg-surface);
  border-top: 1px solid var(--border);
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: stretch;
  z-index: 100;
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
  font-size: 18px;
  line-height: 1;
}
.nav-mobile-label {
  font-family: var(--font-body);
  font-size: 10px;
}

/* ---- Desktop ---- */
@media (min-width: 960px) {
  .sidebar {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    width: var(--nav-width-desktop);
    height: 100dvh;
    background: var(--bg-sidebar);
    padding: var(--gap-md) 0;
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
    margin-bottom: var(--gap-sm);
  }

  .sidebar-logo-icon {
    font-size: 20px;
    color: #fff;
    line-height: 1;
  }

  .sidebar-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    padding: 0 var(--gap-sm);
    list-style: none;
  }

  .sidebar-link {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: var(--radius-md);
    color: var(--sidebar-text);
    transition:
      background var(--transition-fast),
      color var(--transition-fast);
    margin: 0 auto;
  }

  .sidebar-link:hover {
    background: var(--sidebar-active-bg);
    color: var(--sidebar-active);
  }

  .sidebar-link-active {
    background: var(--accent);
    color: #fff;
    box-shadow: var(--shadow-accent);
  }

  .sidebar-icon {
    font-size: 18px;
    line-height: 1;
  }

  .sidebar-tooltip {
    display: none;
    position: absolute;
    left: calc(100% + 10px);
    top: 50%;
    transform: translateY(-50%);
    background: var(--text-primary);
    color: #fff;
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    padding: 4px var(--gap-sm);
    border-radius: var(--radius-sm);
    white-space: nowrap;
    pointer-events: none;
    z-index: 999;
  }

  .sidebar-link:hover .sidebar-tooltip {
    display: block;
  }

  .nav-mobile {
    display: none;
  }

  .layout-main {
    padding: var(--gap-lg);
    padding-bottom: var(--gap-lg);
  }
}
</style>
