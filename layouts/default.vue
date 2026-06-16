<script setup lang="ts">
import { useLanguage } from "~/composables/useLanguage";
import { usePanelStats } from "~/composables/usePanelStats";
import { useDarkMode } from "~/composables/useDarkMode";
import { useLuckyNumbers } from "~/composables/useLuckyNumbers";
import { getGapClass, NEVER_GAP } from "~/utils/lottery";

const route = useRoute();
const { locale, t, toggleLocale, initLocale } = useLanguage();
const { isDark, toggleDarkMode, initDarkMode } = useDarkMode();
const { luckyNumbers, generateLuckyNumbers } = useLuckyNumbers();
const { latestDraw, latestGaps, mostFrequent2d, mostFrequent3b, mostFrequent3f, topDigits } = await usePanelStats();

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

const isLoading = ref(true);

onMounted(() => {
  generateLuckyNumbers();
  initLocale();
  initDarkMode();
  setTimeout(() => {
    isLoading.value = false;
  }, 800);
});

</script>

<template>
  <!-- Loading Screen -->
  <Transition name="loading-fade">
    <div v-if="isLoading" class="loading-screen" aria-live="polite">
      <div class="loading-content">
        <div class="loading-logo">L</div>
        <div class="loading-spinner"></div>
        <p class="loading-text">Lotty</p>
      </div>
    </div>
  </Transition>

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
            <button @click="toggleLocale" class="btn-icon-toggle btn-lang-toggle" :aria-label="locale === 'en' ? 'เปลี่ยนเป็นภาษาไทย' : 'Switch to English'">
              {{ locale === 'en' ? 'TH' : 'EN' }}
            </button>
            <button @click="toggleDarkMode" class="btn-icon-toggle btn-theme-toggle" :aria-label="isDark ? 'Switch to light mode' : 'Toggle dark mode'">
              {{ isDark ? '🌙' : '☀️' }}
            </button>
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
                {{ latestGaps.last2 === NEVER_GAP ? "Never" : `${latestGaps.last2} draws` }}
              </span>
            </div>
            <div class="panel-stat-card">
              <div class="panel-stat-icon panel-stat-icon--gold">3</div>
              <div class="panel-stat-info">
                <span class="panel-stat-value">{{ latestDraw.data.last3b }}</span>
                <span class="panel-stat-label">3 Digit Top</span>
              </div>
              <span v-if="latestGaps && latestGaps.last3b > 0" class="ticket-gap num-mono" :class="getGapClass(latestGaps.last3b)">
                {{ latestGaps.last3b === NEVER_GAP ? "Never" : `${latestGaps.last3b} draws` }}
              </span>
            </div>
            <div class="panel-stat-card">
              <div class="panel-stat-icon panel-stat-icon--info">3</div>
              <div class="panel-stat-info">
                <span class="panel-stat-value">{{ latestDraw.data.last3f }}</span>
                <span class="panel-stat-label">3 Digit Bottom</span>
              </div>
              <span v-if="latestGaps && latestGaps.last3f > 0" class="ticket-gap num-mono" :class="getGapClass(latestGaps.last3f)">
                {{ latestGaps.last3f === NEVER_GAP ? "Never" : `${latestGaps.last3f} draws` }}
              </span>
            </div>
          </div>
        </section>

        <!-- Most Frequent All Time -->
        <section class="panel-section">
          <div class="panel-section-header">
            <h2 class="panel-section-title">Most Frequent (All Time)</h2>
          </div>
          <div class="panel-stat-list">
            <div class="panel-stat-card">
              <div class="panel-stat-icon panel-stat-icon--primary">2</div>
              <div class="panel-stat-info">
                <span class="panel-stat-value">{{ mostFrequent2d?.number ?? '—' }}</span>
                <span class="panel-stat-label">2 Digit</span>
              </div>
              <span v-if="mostFrequent2d" class="num-mono panel-stat-meta">{{ mostFrequent2d.count }}x</span>
            </div>
            <div class="panel-stat-card">
              <div class="panel-stat-icon panel-stat-icon--gold">3</div>
              <div class="panel-stat-info">
                <span class="panel-stat-value">{{ mostFrequent3b?.number ?? '—' }}</span>
                <span class="panel-stat-label">3 Digit Top</span>
              </div>
              <span v-if="mostFrequent3b" class="num-mono panel-stat-meta">{{ mostFrequent3b.count }}x</span>
            </div>
            <div class="panel-stat-card">
              <div class="panel-stat-icon panel-stat-icon--info">3</div>
              <div class="panel-stat-info">
                <span class="panel-stat-value">{{ mostFrequent3f?.number ?? '—' }}</span>
                <span class="panel-stat-label">3 Digit Bottom</span>
              </div>
              <span v-if="mostFrequent3f" class="num-mono panel-stat-meta">{{ mostFrequent3f.count }}x</span>
            </div>
          </div>
        </section>

        <!-- Top 10 Digits -->
        <section class="panel-section">
          <div class="panel-section-header">
            <h2 class="panel-section-title">Top 10 Digits (0-9)</h2>
          </div>
          <div class="panel-digits-grid">
            <div v-for="(item, i) in topDigits" :key="item.digit" class="panel-digit-item">
              <span class="panel-digit-rank">{{ i + 1 }}</span>
              <span class="panel-digit-value num-display">{{ item.digit }}</span>
              <span class="panel-digit-count num-mono">{{ item.count }}x</span>
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
</template>

<style scoped>
/* ---- Root container — app layout ---- */
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
	background: var(--bg-raised);
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

.btn-icon-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--stat-icon-size);
  height: var(--stat-icon-size);
  border-radius: var(--radius-full);
  background: var(--bg-raised);
  border: 1px solid var(--border);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    transform var(--transition-fast);
}

.btn-icon-toggle:hover {
  background: var(--bg-hover);
  border-color: var(--accent);
  transform: scale(1.05);
}

.btn-lang-toggle { font-size: var(--text-xs); font-weight: var(--weight-bold); color: var(--text-secondary); }
.btn-theme-toggle { font-size: var(--text-md); }

/* ---- Main content ---- */
.layout-main {
  flex: 1;
  overflow-y: auto;
	overflow-x: hidden;
  padding: var(--gap-lg) var(--gap-lg) var(--gap-xl);
  scroll-behavior: smooth;

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
.sidebar {
  display: none;
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
  display: none;
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

.panel-stat-meta {
  font-size: var(--text-xs);
  color: var(--accent);
  font-weight: var(--weight-medium);
}

/* ---- Top 10 Digits grid ---- */
.panel-digits-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--gap-xs);
}

.panel-digit-item {
  display: flex;
  align-items: center;
  gap: var(--gap-xs);
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: var(--gap-xs) var(--gap-sm);
}

.panel-digit-rank {
  font-size: var(--text-xs);
  color: var(--text-muted);
  font-weight: var(--weight-medium);
  min-width: var(--gap-md);
}

.panel-digit-value {
  font-size: var(--text-md);
  font-weight: var(--weight-bold);
  color: var(--accent);
  flex: 1;
}

.panel-digit-count {
  font-size: var(--text-xs);
  color: var(--text-secondary);
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

/* ---- Sidebar Footer ---- */
.sidebar-footer {
  margin-top: auto;
  padding-top: var(--gap-md);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
}

.sidebar-footer-text {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

/* ── Responsive Breakpoints (Mobile-First) ── */
@media (max-width: 767px) {
  .layout-body {
    height: calc(100% - var(--nav-height-mobile));
  }
}

@media (min-width: 1024px) {
  .sidebar {
    display: flex;
  }
  .panel {
    display: flex;
  }
  .nav-mobile {
    display: none;
  }

}

/* ---- Loading Screen ---- */
.loading-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap-lg);
}

.loading-logo {
  width: var(--loading-logo-size);
  height: var(--loading-logo-size);
  background: linear-gradient(135deg, var(--accent), var(--accent-hover));
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--stat-icon-size);
  font-weight: var(--weight-bold);
  color: var(--color-white);
  box-shadow: 0 8px 24px rgba(108, 92, 231, 0.3);
  animation: loading-pulse 2s ease-in-out infinite;
}

@keyframes loading-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 8px 24px rgba(108, 92, 231, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 12px 32px rgba(108, 92, 231, 0.4);
  }
}

.loading-spinner {
  width: var(--logo-size);
  height: var(--logo-size);
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: var(--radius-full);
  animation: loading-spin 0.8s linear infinite;
}

@keyframes loading-spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  font-family: var(--font-display);
  letter-spacing: 2px;
  animation: loading-fade-in 0.5s ease-out;
}

@keyframes loading-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.3s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
</style>
