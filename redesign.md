# REDESIGN.md — Lotty
> **Ref:** Sneat Bootstrap Admin Template (Free)  
> https://demos.themeselection.com/sneat-bootstrap-html-admin-template-free/html/  
> **Color source:** github.com/themeselection/sneat-bootstrap-html-admin-template-free
>
> **Strategy:** Full redesign — เปลี่ยนได้ทั้ง HTML structure + CSS  
> เนื้อหา/logic/API/TypeScript ไม่เปลี่ยน

---

## 1. SCOPE

### ✅ เปลี่ยนได้ทั้งหมด
- `assets/style/variables.css` — แทนที่ด้วย section 3
- `assets/style/base.css`, `assets/style/components.css`
- `<template>` + `<style scoped>` ในทุกไฟล์
- Font import ใน `nuxt.config.ts`

### 🔒 ห้ามแตะ
- `<script setup>` ทุกไฟล์ — logic, composables, API calls, TypeScript
- `server/` ทั้งหมด
- `nuxt.config.ts` ยกเว้น head.link, `vercel.json`, `.env`

---

## 2. DESIGN DIRECTION — Sneat Patterns

| Element | Sneat pattern | Lotty เดิม |
|---|---|---|
| Layout shell | `layout-wrapper > layout-container > aside + layout-page` | `layout > sidebar + layout-body` |
| Sidebar | expanded 260px, logo + text, nav items มี icon+label | icon-only 64px |
| Nav item active | `bg-label-primary` tint + left border 2px primary | bg tint + border 2px |
| Topbar | detached จาก sidebar, search bar ซ้าย | full-width, title ซ้าย |
| Card | `card > card-header + card-body` แยก section | padding ทั้งก้อน |
| Card header | `h5.card-title` + `dropdown` ขวา | ไม่มี |
| Stats widget | icon avatar + label + number + trend badge | ตัวเลขใน grid cell |
| Page grid | `row > col-*` responsive columns | CSS grid 1→2 col |

---

## 3. `variables.css` — แทนที่ทั้งไฟล์

```css
/* ============================================================
   Lotty — variables.css
   Single source of truth. ห้ามใส่ hardcode ใน file อื่น
   Redesign ref: Sneat Bootstrap Admin Template (Free)
   Color source: assets/vendor/css/core.css
   ============================================================ */

:root {
  /* ----------------------------------------------------------
     Color — Sneat Light Theme
  ---------------------------------------------------------- */
  --bg-base:    #f5f5f9;   /* --bs-body-bg */
  --bg-surface: #ffffff;   /* --bs-paper-bg */
  --bg-raised:  #f2f3f3;   /* --bs-gray-60 */
  --bg-sidebar: #ffffff;   /* --bs-menu-bg */
  --bg-hover:   #f2f3f3;   /* --bs-menu-hover-bg */

  --accent:       #696cff;   /* --bs-primary */
  --accent-light: #e7e7ff;   /* --bs-primary-bg-subtle */
  --accent-hover: #5f61e6;   /* --bs-link-hover-color */

  --accent-gold:         #ffab00;  /* --bs-warning */
  --accent-gold-light:   #fff2d6;  /* --bs-warning-bg-subtle */
  --accent-green:        #71dd37;  /* --bs-success */
  --accent-green-light:  #e8fadf;  /* --bs-success-bg-subtle */
  --accent-danger:       #ff3e1d;  /* --bs-danger */
  --accent-danger-light: #ffe0db;  /* --bs-danger-bg-subtle */
  --accent-info:         #03c3ec;  /* --bs-info */
  --accent-info-light:   #d7f5fc;  /* --bs-info-bg-subtle */
  --accent-dim:          #a7acb2;  /* --bs-gray-400 */

  --sidebar-text:      #384551;   /* --bs-menu-color */
  --sidebar-active:    #696cff;   /* --bs-primary */
  --sidebar-active-bg: #e7e7ff;   /* --bs-primary-bg-subtle */

  --text-primary:   #384551;   /* --bs-heading-color */
  --text-secondary: #646e78;   /* --bs-body-color */
  --text-muted:     #a7acb2;   /* --bs-secondary-color */

  --border:        #e4e6e8;   /* --bs-border-color */
  --border-strong: #bdc1c5;   /* --bs-gray-300 */

  /* ----------------------------------------------------------
     Typography
  ---------------------------------------------------------- */
  --font-display: "IBM Plex Sans Thai", "Public Sans", sans-serif;
  --font-body:    "IBM Plex Sans Thai", "Public Sans", sans-serif;
  --font-mono:    "JetBrains Mono", "Courier New", monospace;

  --text-xs: clamp(11px, 1.2vw, 12px);
  --text-sm: clamp(13px, 1.4vw, 14px);
  --text-md: clamp(15px, 1.6vw, 16px);
  --text-lg: clamp(18px, 2vw, 20px);
  --text-xl: clamp(28px, 3.5vw, 40px);

  --weight-regular: 400;
  --weight-medium:  500;
  --weight-bold:    600;   /* Sneat heading = 600 */

  --leading-tight:  1.2;
  --leading-normal: 1.375;  /* --bs-body-line-height */
  --leading-loose:  1.75;

  /* ----------------------------------------------------------
     Spacing
  ---------------------------------------------------------- */
  --gap-xs: 5px;
  --gap-sm: 10px;
  --gap-md: 15px;
  --gap-lg: 30px;

  /* ----------------------------------------------------------
     Border & Radius
  ---------------------------------------------------------- */
  --border-width:        1px;
  --border-style:        solid;
  --border-color:        var(--border);
  --border-color-strong: var(--accent-dim);

  --radius-xs:   3px;
  --radius-sm:   6px;    /* --bs-border-radius = 0.375rem */
  --radius-md:   8px;    /* --bs-border-radius-lg = 0.5rem */
  --radius-lg:   10px;   /* --bs-border-radius-xl = 0.625rem */
  --radius-full: 9999px;

  /* ----------------------------------------------------------
     Shadow — Sneat source values
  ---------------------------------------------------------- */
  --shadow-card:   0 2px 6px 0 rgba(34, 48, 62, 0.08);   /* --bs-box-shadow-sm */
  --shadow-raised: 0 3px 8px 0 rgba(34, 48, 62, 0.10);   /* --bs-box-shadow */
  --shadow-lg:     0 4px 12px 0 rgba(34, 48, 62, 0.14);  /* --bs-box-shadow-lg */

  /* ----------------------------------------------------------
     Transition / Layout (ไม่เปลี่ยน)
  ---------------------------------------------------------- */
  --transition-fast:   150ms ease;
  --transition-normal: 250ms ease;

  --nav-height-mobile:  56px;
  --nav-width-desktop:  260px;   /* ← เปลี่ยนจาก 64px → Sneat expanded sidebar */
  --nav-width-expanded: 260px;
  --topbar-height:      64px;    /* ← Sneat navbar height */
  --content-max-width:  1400px;

  --bp-mobile:  600px;
  --bp-desktop: 960px;
}
```

---

## 4. FONT IMPORT (`nuxt.config.ts`)

```ts
{ rel: "preconnect", href: "https://fonts.googleapis.com" },
{
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600&display=swap"
}
```

---

## 5. `layouts/default.vue` — HTML + CSS ใหม่ทั้งหมด

Sneat shell pattern: `layout-wrapper > layout-container > aside.layout-menu + div.layout-page > nav.layout-navbar + div.content-wrapper`

```vue
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

/* ── Sidebar hidden on mobile ── */
.layout-menu { display: none; }

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

.navbar-right { display: flex; align-items: center; gap: var(--gap-sm); }

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
  padding: clamp(var(--gap-md), 3vw, var(--gap-lg));
  padding-bottom: calc(var(--nav-height-mobile) + var(--gap-lg));
  max-width: var(--content-max-width);
}

/* ── Mobile Bottom Nav ── */
.nav-mobile {
  position: fixed;
  bottom: 0; left: 0; right: 0;
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

.nav-mobile-item-active { color: var(--accent); }
.nav-mobile-icon { font-size: var(--text-md); font-weight: var(--weight-bold); line-height: 1; }
.nav-mobile-label { font-size: var(--text-xs); font-weight: var(--weight-medium); }

/* ── Desktop ── */
@media (min-width: 960px) {
  .layout-wrapper { flex-direction: row; }

  .layout-menu {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    width: var(--nav-width-desktop);
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

  .menu-item { padding: 2px var(--gap-sm); }

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

  .menu-label { flex: 1; }

  .navbar-menu-toggle { display: none; }
  .nav-mobile { display: none; }

  .content-body {
    padding: clamp(var(--gap-md), 3vw, var(--gap-lg));
    padding-bottom: clamp(var(--gap-md), 3vw, var(--gap-lg));
  }
}
</style>
```

---

## 6. COMPONENT STYLES (`components.css`)

```css
/* ── Card — Sneat pattern: card > card-header + card-body ── */
.card {
  background: var(--bg-surface);
  border: none;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--gap-md) var(--gap-md);
  border-bottom: 1px solid var(--border);
}

.card-title {
  font-size: var(--text-md);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  line-height: 1;
  margin: 0;
}

.card-subtitle {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-top: 2px;
}

.card-body { padding: var(--gap-md); }

/* ── Stat Widget — icon avatar + number + trend ── */
.stat-widget {
  display: flex;
  flex-direction: column;
  gap: var(--gap-sm);
}

.stat-widget-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.stat-avatar {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-lg);
  flex-shrink: 0;
}

.stat-avatar-primary  { background: var(--accent-light);        color: var(--accent); }
.stat-avatar-gold     { background: var(--accent-gold-light);   color: var(--accent-gold); }
.stat-avatar-green    { background: var(--accent-green-light);  color: var(--accent-green); }
.stat-avatar-danger   { background: var(--accent-danger-light); color: var(--accent-danger); }
.stat-avatar-info     { background: var(--accent-info-light);   color: var(--accent-info); }

.stat-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.stat-value {
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  font-family: var(--font-mono);
  line-height: 1;
  letter-spacing: 2px;
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  padding: 2px var(--gap-xs);
  border-radius: var(--radius-full);
}

.stat-trend-up   { color: var(--accent-green);  background: var(--accent-green-light); }
.stat-trend-down { color: var(--accent-danger);  background: var(--accent-danger-light); }
.stat-trend-warm { color: var(--accent-gold);    background: var(--accent-gold-light); }

/* ── Button ── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--gap-xs);
  padding: 0 var(--gap-md);
  min-height: 38px;
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  cursor: pointer;
  white-space: nowrap;
  border: none;
  transition: opacity var(--transition-fast), box-shadow var(--transition-fast);
}

.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-gold {
  background: var(--accent-gold);
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(255, 171, 0, 0.4);
}
.btn-gold:hover:not(:disabled) { opacity: 0.88; }

.btn-ghost {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
}
.btn-ghost:hover:not(:disabled) {
  background: var(--bg-hover);
  border-color: var(--accent);
  color: var(--accent);
}

.btn-sm { min-height: 30px; padding: 0 var(--gap-sm); font-size: var(--text-xs); }

/* ── Badge ── */
.badge-hot {
  background: var(--accent-gold-light);
  color: var(--accent-gold);
  border-radius: var(--radius-full);
  padding: 2px var(--gap-sm);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
}

.badge-cold {
  background: var(--accent-green-light);
  color: var(--accent-green);
  border-radius: var(--radius-full);
  padding: 2px var(--gap-sm);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
}

/* ── Section title ── */
.section-title {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

/* ── Skeleton ── */
.skeleton {
  background: linear-gradient(90deg, var(--bg-raised) 25%, var(--border) 50%, var(--bg-raised) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease infinite;
  border-radius: var(--radius-sm);
}

@keyframes skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Divider ── */
.divider-dashed {
  border: none;
  border-top: 1px dashed var(--border);
  margin: var(--gap-md) 0;
}

/* ── Focus ring ── */
.focus-ring:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

---

## 7. PAGE TEMPLATES — HTML ใหม่ตาม Sneat pattern

### 7.1 `pages/index.vue` — เลขแนะนำ

**Pattern:** stats row (3 stat widgets) + ticket card + quick pick card + lookup card

```vue
<template>
  <div class="page-content">
    <FilterBar />

    <!-- ── Stat Row — ผลล่าสุด ── -->
    <section v-if="latestDraw?.data" class="stats-row">
      <div class="card">
        <div class="card-body stat-widget">
          <div class="stat-widget-header">
            <div class="stat-avatar stat-avatar-primary">🎯</div>
          </div>
          <p class="stat-label">รางวัลที่ 1</p>
          <p class="stat-value">{{ latestDraw.data.first }}</p>
          <span class="stat-trend stat-trend-warm">งวด {{ formatDate(latestDraw.data.draw_date) }}</span>
        </div>
      </div>
      <div class="card">
        <div class="card-body stat-widget">
          <div class="stat-widget-header">
            <div class="stat-avatar stat-avatar-gold">3↓</div>
          </div>
          <p class="stat-label">3 ตัวล่าง</p>
          <p class="stat-value">{{ latestDraw.data.last3b }}</p>
        </div>
      </div>
      <div class="card">
        <div class="card-body stat-widget">
          <div class="stat-widget-header">
            <div class="stat-avatar stat-avatar-info">2↓</div>
          </div>
          <p class="stat-label">2 ตัวล่าง</p>
          <p class="stat-value">{{ latestDraw.data.last2 }}</p>
        </div>
      </div>
    </section>

    <!-- ── Ticket Card ── -->
    <LoadingSkeleton v-if="pending" variant="ticket" />
    <ErrorCard v-else-if="error" message="โหลดข้อมูลไม่สำเร็จ" :on-retry="refresh" />
    <EmptyState v-else-if="!advisor" reason="no_data_in_range" :scope="filter.scope" />
    <LotteryTicketCard
      v-else
      :draw_date_next="advisor.draw_date_next"
      :suggestions="advisor.suggestions"
      :rationale="advisor.rationale"
      :scope="scopeLabel"
    />

    <!-- ── Quick Pick Card ── -->
    <template v-if="!pending && !error && advisor">
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Quick Pick</h2>
            <p class="card-subtitle">สุ่มเลขตามสถิติ — เลขค้างนานได้น้ำหนักมากกว่า</p>
          </div>
        </div>
        <div class="card-body">
          <div class="quickpick-actions">
            <button class="btn btn-gold" @click="generateQuickPick" :disabled="quickPickLoading">
              <span v-if="quickPickLoading">กำลังคำนวณ...</span>
              <span v-else>สุ่มเลขตามสถิติ</span>
            </button>
            <button class="btn btn-ghost btn-sm" @click="quickPick = null" v-if="quickPick && !quickPickLoading">รีเซ็ต</button>
          </div>
          <div v-if="quickPick" class="quickpick-result">
            <div class="quickpick-numbers">
              <div class="card quickpick-col">
                <p class="stat-label">2 ตัวล่าง</p>
                <p class="stat-value">{{ quickPick.last2 }}</p>
              </div>
              <div class="card quickpick-col">
                <p class="stat-label">3 ตัวล่าง</p>
                <p class="stat-value">{{ quickPick.last3b }}</p>
              </div>
              <div class="card quickpick-col">
                <p class="stat-label">3 ตัวหน้า</p>
                <p class="stat-value">{{ quickPick.last3f }}</p>
              </div>
            </div>
            <button class="btn btn-ghost btn-sm" @click="copyQuickPick">คัดลอกเลข</button>
          </div>
        </div>
      </div>

      <!-- ── Lookup Card ── -->
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">ค้นหาสถิติเลข</h2>
          </div>
        </div>
        <div class="card-body">
          <div class="lookup-row">
            <input
              v-model="lookupQuery"
              class="search-input focus-ring"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              placeholder="พิมพ์เลข 2–3 ตัว"
              maxlength="3"
              aria-label="ค้นหาสถิติเลข"
              @keydown.enter="doLookup"
              @input="validateNumericInput"
            />
            <button class="btn btn-gold" @click="doLookup" :disabled="lookupPending || lookupQuery.length < 2">
              {{ lookupPending ? "กำลังค้นหา..." : "ค้นหา" }}
            </button>
          </div>
          <div v-if="lookupResult" class="lookup-result">
            <div class="lookup-grid">
              <div class="card lookup-stat">
                <p class="stat-label">ออกทั้งหมด</p>
                <p class="stat-value num-mono">{{ lookupResult.count }} ครั้ง</p>
              </div>
              <div class="card lookup-stat">
                <p class="stat-label">อันดับ</p>
                <p class="stat-value num-mono">{{ lookupResult.rank }}/{{ lookupResult.total }}</p>
              </div>
              <div class="card lookup-stat">
                <p class="stat-label">ออกล่าสุด</p>
                <p class="stat-value num-mono">{{ lookupResult.last_draw || "—" }}</p>
              </div>
              <div class="card lookup-stat">
                <p class="stat-label">ค้างมา</p>
                <p class="stat-value num-mono">{{ lookupResult.gap === 999 ? "ไม่เคยออก" : `${lookupResult.gap} งวด` }}</p>
              </div>
            </div>
          </div>
          <EmptyState v-else-if="lookupQuery && !lookupPending" reason="no_search_result" />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-content { display: flex; flex-direction: column; gap: var(--gap-md); }

/* Stats row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--gap-md);
}

@media (max-width: 600px) {
  .stats-row { grid-template-columns: 1fr; }
}

/* Quick pick */
.quickpick-actions { display: flex; gap: var(--gap-sm); margin-bottom: var(--gap-md); }
.quickpick-result  { display: flex; flex-direction: column; gap: var(--gap-sm); }
.quickpick-numbers {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--gap-sm);
}

.quickpick-col {
  padding: var(--gap-md);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap-xs);
  box-shadow: none;
  border: 1px solid var(--border);
}

/* Lookup */
.lookup-row { display: flex; gap: var(--gap-sm); margin-bottom: var(--gap-md); }

.search-input {
  flex: 1;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: var(--gap-xs) var(--gap-sm);
  font-family: var(--font-mono);
  font-size: var(--text-md);
  color: var(--text-primary);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.search-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(105, 108, 255, 0.15);
  outline: none;
}

.lookup-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--gap-sm);
}

.lookup-stat {
  padding: var(--gap-sm) var(--gap-md);
  box-shadow: none;
  border: 1px solid var(--border);
}
</style>
```

### 7.2 `pages/2digit.vue` / `pages/3digit.vue` — สถิติ

**Pattern:** filter bar + card(header+body) ครอบ podium list + card ครอบ heatmap

```vue
<!-- ตัวอย่าง wrapper structure — ใส่ใน <template> แทน section เดิม -->
<template>
  <div class="page-content">
    <FilterBar />

    <LoadingSkeleton v-if="pending" variant="heatmap" />
    <ErrorCard v-else-if="error" message="โหลดข้อมูลไม่สำเร็จ" :on-retry="refresh" />
    <EmptyState v-else-if="!ranking.length" reason="no_data_in_range" :scope="filter.scope" />
    <template v-else>

      <!-- Top 10 + Heatmap row -->
      <div class="stats-grid">

        <!-- Top 10 -->
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">ออกบ่อย 10 อันดับ</h2>
            </div>
          </div>
          <div class="card-body">
            <div class="podium-list">
              <PodiumCard v-for="(item, i) in top10" :key="item.number" :item="item" :rank="i + 1" />
            </div>
          </div>
        </div>

        <!-- Heatmap -->
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Heatmap ทุกเลข</h2>
              <p class="card-subtitle">คลิกเลขเพื่อดูรายละเอียด</p>
            </div>
          </div>
          <div class="card-body">
            <HeatmapGrid :data="ranking" :selected="selected" @select="selected = $event === selected ? null : $event" />
          </div>
        </div>

      </div>
    </template>
  </div>
</template>

<style scoped>
.page-content { display: flex; flex-direction: column; gap: var(--gap-md); }

.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--gap-md);
}

@media (min-width: 960px) {
  .stats-grid { grid-template-columns: 1fr 1fr; }
}
</style>
```

### 7.3 `components/PodiumCard.vue` — Sneat list-item pattern

```vue
<template>
  <div
    class="podium-item"
    :class="{
      'podium-item-hot':  item.label === 'ออกบ่อย',
      'podium-item-cold': item.label === 'ไม่เคยออก',
    }"
  >
    <!-- rank avatar -->
    <div class="podium-rank-avatar" :class="rank <= 3 ? 'podium-rank-top' : ''">
      {{ rank }}
    </div>

    <!-- number + meta -->
    <div class="podium-info">
      <span class="num-display podium-number">{{ item.number }}</span>
      <div class="podium-bar-wrap">
        <div class="podium-bar">
          <div class="podium-bar-fill" :style="{ width: `${item.pct}%` }"></div>
        </div>
        <span class="num-mono podium-pct">{{ (item.pct ?? 0).toFixed(1) }}%</span>
      </div>
    </div>

    <!-- right: gap badge -->
    <div class="podium-right">
      <span v-if="item.label === 'ออกบ่อย'" class="badge-hot">ออกบ่อย</span>
      <span v-else-if="item.gap > 0" class="podium-gap-label">
        {{ item.gap === 999 ? "ไม่เคย" : `${item.gap} งวด` }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.podium-item {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  padding: var(--gap-sm) 0;
  border-bottom: 1px solid var(--border);
}
.podium-item:last-child { border-bottom: none; }

.podium-item-hot  { border-left: 3px solid var(--accent-gold);  padding-left: var(--gap-sm); }
.podium-item-cold { border-left: 3px solid var(--accent-green); padding-left: var(--gap-sm); }

.podium-rank-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--bg-raised);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  flex-shrink: 0;
}

.podium-rank-top {
  background: var(--accent-light);
  color: var(--accent);
}

.podium-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.podium-number {
  font-size: var(--text-md);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  letter-spacing: 2px;
}

.podium-bar-wrap { display: flex; align-items: center; gap: var(--gap-xs); }

.podium-bar {
  flex: 1;
  height: 4px;
  background: var(--bg-raised);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.podium-bar-fill {
  height: 100%;
  background: var(--accent);
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}

.podium-pct { font-size: var(--text-xs); color: var(--text-muted); white-space: nowrap; }

.podium-right { flex-shrink: 0; }

.podium-gap-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
  white-space: nowrap;
}
</style>
```

### 7.4 `components/FilterBar.vue` — pill tabs pattern

```vue
<!-- เปลี่ยน chip wrapper เป็น tab-pills style ตาม Sneat -->
<style scoped>
.filter-bar {
  display: flex;
  flex-direction: column;
  gap: var(--gap-sm);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  flex-wrap: wrap;
}

.filter-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--text-muted);
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.filter-chips {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

/* chip = pill tab */
.filter-chip {
  padding: 5px var(--gap-sm);
  border-radius: var(--radius-full);
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-body);
  white-space: nowrap;
}

.filter-chip:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.filter-chip-active {
  background: var(--accent);
  border-color: var(--accent);
  color: #ffffff;
}
</style>
```

---

## 8. AGENT INSTRUCTIONS

ทำตามลำดับนี้ทีละ step อย่ากระโดด:

1. **`variables.css`** — แทนที่ทั้งไฟล์ด้วย section 3
2. **`nuxt.config.ts`** — อัปเดต font link ตาม section 4
3. **`components.css`** — แทนที่ด้วย section 6 (`card`, `card-header`, `card-body`, `stat-widget`, `btn`, `badge`, `skeleton`)
4. **`layouts/default.vue`** — แทน `<template>` + `<style scoped>` ด้วย section 5 ทั้งหมด
5. **`components/PodiumCard.vue`** — แทน template+style ด้วย section 7.3
6. **`components/FilterBar.vue`** — แทน style ด้วย section 7.4 (template เดิมใช้ได้)
7. **`pages/index.vue`** — แทน template+style ด้วย section 7.1
8. **`pages/2digit.vue`** + **`pages/3digit.vue`** — ปรับ template ให้ครอบด้วย `card > card-header + card-body` ตาม section 7.2

**กฎ:**
- ห้าม hardcode hex/px — ยกเว้น `≤ 4px`, `#ffffff`
- ห้ามแตะ `<script setup>` ทุกไฟล์
- ถ้าต้องเพิ่ม token ใหม่ → ถามก่อน

---

## 9. COLOR MAPPING

| Token | เดิม | ใหม่ | Sneat source |
|---|---|---|---|
| `--accent` | `#3b82f6` | `#696cff` | `--bs-primary` |
| `--accent-light` | `#dbeafe` | `#e7e7ff` | `--bs-primary-bg-subtle` |
| `--accent-hover` | `#2563eb` | `#5f61e6` | `--bs-link-hover-color` |
| `--accent-gold` | `#f59e0b` | `#ffab00` | `--bs-warning` |
| `--accent-green` | `#10b981` | `#71dd37` | `--bs-success` |
| `--accent-danger` | `#ef4444` | `#ff3e1d` | `--bs-danger` |
| `--bg-base` | `#f0f4f8` | `#f5f5f9` | `--bs-body-bg` |
| `--bg-hover` | `#e8f0f7` | `#f2f3f3` | `--bs-menu-hover-bg` |
| `--text-primary` | `#1e293b` | `#384551` | `--bs-heading-color` |
| `--text-secondary` | `#334155` | `#646e78` | `--bs-body-color` |
| `--text-muted` | `#64748b` | `#a7acb2` | `--bs-secondary-color` |
| `--border` | `#cbd5e1` | `#e4e6e8` | `--bs-border-color` |
| `--nav-width-desktop` | `64px` | `260px` | Sneat expanded sidebar |
| `--topbar-height` | `56px` | `64px` | Sneat navbar height |
| `--weight-bold` | `700` | `600` | Sneat heading weight |
| `--leading-normal` | `1.5` | `1.375` | `--bs-body-line-height` |