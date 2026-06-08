# Thai Lottery Stats Dashboard — design.md

## 1. Product Overview

**ชื่อโปรดักต์:** Lotty
**คอนเซปต์:** เครื่องมือวิเคราะห์สถิติสลากกินแบ่งรัฐบาลไทยย้อนหลัง ช่วยให้ผู้ใช้ทั่วไปที่ "คิดเลขไม่ออก" สามารถดูแนวโน้มและตัดสินใจซื้อได้อย่างมีข้อมูลรองรับ
**กลุ่มเป้าหมาย:** คนไทยทั่วไปที่เล่นหวย อายุ 25–55 ปี ใช้มือถือเป็นหลัก ไม่จำเป็นต้องมีความรู้ด้านข้อมูล
**ข้อความหลัก:** "ดูสถิติ ไม่ใช่เดา"

---

## 2. Aesthetic Direction

**สไตล์:** Lucky Terminal — ผสม aesthetic ของ retro lottery ticket (กระดาษลอตเตอรี่เก่า สีเหลือง/แดง/ทอง) กับ modern dark data dashboard ให้รู้สึกเป็นทั้ง "เครื่องมือของนักวิเคราะห์" และ "มีความสนุกแบบเสี่ยงโชค"

**Palette:**

```
--bg-base:        #0D0D0D   /* almost black */
--bg-surface:     #1A1A1A   /* card surface */
--bg-raised:      #242424   /* raised element */
--accent-gold:    #F5C842   /* lottery gold — primary accent */
--accent-red:     #E84040   /* hot number highlight */
--accent-green:   #3DBA6A   /* cold/new number */
--accent-dim:     #5A5A5A   /* muted labels */
--text-primary:   #F0EDE4   /* warm white */
--text-secondary: #9E9A90   /* secondary text */
--border:         #2E2E2E   /* subtle border */
--glow-gold:      rgba(245, 200, 66, 0.15)
```

**Typography:**

```
Display / หัวตัวเลขใหญ่:  "Teko" (Google Fonts) — condensed, strong, lottery-board feel
UI Labels / ภาษาไทย:      "Sarabun" (Google Fonts) — อ่านง่าย น้ำหนักดี
Stat Numbers:              "JetBrains Mono" — monospace สำหรับตัวเลขสถิติ
```

**Texture / Atmosphere:**

- พื้นหลัง: subtle noise texture overlay 5% opacity
- Card borders: 1px solid `--border` พร้อม top-highlight `rgba(245,200,66,0.1)`
- Hot numbers: golden glow `box-shadow: 0 0 12px var(--glow-gold)`
- Dividers: dashed line style คล้ายขอบตั๋วลอตเตอรี่

---

## 3. Information Architecture

```
Lotty
├── Home / Filter Hub          ← จุดเริ่มต้น กำหนดขอบเขตการวิเคราะห์
├── 2-Digit Stats              ← สถิติเลข 2 ตัวบน/ล่าง
├── 3-Digit Stats              ← สถิติเลข 3 ตัวบน/หน้า/ล่าง
├── Digit-by-Digit (6 หลัก)   ← แต่ละหลักของรางวัลที่ 1
├── Number Advisor             ← feature หลัก: "เลขแนะนำ" สำหรับงวดนี้
└── Archive / History          ← ผลย้อนหลังรายงวด
```

---

## 4. Pages & Components

### 4.1 Filter Hub (Global Controls)

ปรากฏเป็น sticky bar ด้านบนทุกหน้า

| Control      | ตัวเลือก                                 | Default     |
| ------------ | ---------------------------------------- | ----------- |
| ช่วงเวลา     | 1ปี / 3ปี / 5ปี / 10ปี / ทั้งหมด         | 5ปี         |
| ประเภทรางวัล | รางวัลที่ 1 / 2ตัวบน / 2ตัวล่าง / 3ตัวบน | รางวัลที่ 1 |
| เดือนที่ออก  | ทั้งปี / เฉพาะเดือน (1–12)               | ทั้งปี      |
| วันที่ออก    | ทุกงวด / 1 ของเดือน / 16 ของเดือน        | ทุกงวด      |

> การเปลี่ยน filter ทุกตัวจะ re-render ทุก widget โดยอัตโนมัติ (no page reload)

---

### 4.2 2-Digit Stats Page

**Hero Widget — Top Heatmap**

- Grid 10×10 แสดงเลข 00–99
- สีตาม frequency: เย็น (ไม่ค่อยออก) → ร้อน (ออกบ่อย) โดยใช้ gold scale
- Hover: tooltip แสดงจำนวนครั้งและงวดล่าสุดที่ออก
- Click: highlight เลขนั้นทั่วทั้งหน้า

**Podium Widget — Top 10 / Bottom 10**

- แสดงอันดับ 1–10 เลขที่ออกบ่อยสุด (🔥) และน้อยสุด (🧊)
- แต่ละ card: ตัวเลข 2 หลักขนาดใหญ่ + bar แสดง % relative frequency + ป้าย "ออกล่าสุด: งวดที่ XX"

**Digit Breakdown Chart**

- แยกหลักสิบ vs หลักหน่วย
- แท่ง 0–9 แต่ละหลักแสดงความถี่
- ใช้คู่ได้ (หลักสิบ + หลักหน่วย side by side)

**Last Seen Timeline**

- Scatter plot แนวนอน: x = เวลา, y = เลข
- แสดงว่าแต่ละเลขห่างจากครั้งล่าสุดนานแค่ไหน

---

### 4.3 3-Digit Stats Page

โครงสร้างคล้าย 2-Digit แต่เพิ่ม:

**Top Frequency Table**

- ตารางเรียงลำดับ 000–999 พร้อม filter ค้นหา
- แสดง: เลข | ออกกี่ครั้ง | ครั้งล่าสุด | ห่างกี่งวด

**Pattern Insight**

- เลขหน้า: ตัวเลขร้อย 0–9 ออกกี่ครั้ง
- เลขกลาง: ตัวเลขสิบ 0–9 ออกกี่ครั้ง
- เลขท้าย: ตัวเลขหน่วย 0–9 ออกกี่ครั้ง

---

### 4.4 Digit-by-Digit (รางวัลที่ 1 แยกหลัก)

**Layout:** 6 column cards แนวนอน (หลักแสน → หน่วย)

แต่ละ card แสดง:

```
[ หลักที่ X ]
─────────────
เลขฮอต: 7 (ออก 18 ครั้ง)
เลขเย็น: 2 (ออก 4 ครั้ง)

Mini bar chart: 0123456789
แต่ละแท่ง = ความถี่ของหลักนั้น
```

**Combo Finder** (interactive)

- ให้ผู้ใช้ล็อคบางหลัก เช่น "ฉันอยากได้เลขที่ขึ้นต้นด้วย 7 และลงท้ายด้วย 5"
- ระบบ filter และแสดง frequency ของ pattern นั้น

---

### 4.5 Number Advisor (Feature หลัก)

> หน้านี้คือ "จุดขาย" ของแอป — ต้องดูดีและน่าเชื่อถือ

**ส่วนที่ 1 — เลขแนะนำงวดนี้**

แสดงเป็น lottery-ticket style card:

```
┌─────────────────────────────────┐
│  🎯 เลขแนะนำงวด 1 ก.ค. 2569    │
│  (อิงสถิติ 5 ปีย้อนหลัง)        │
│                                  │
│  2 ตัวบน:  [ 47 ]               │
│  2 ตัวล่าง: [ 23 ]              │
│  3 ตัวบน:  [ 815 ]              │
│                                  │
│  💡 ยังไม่ออกมา 14 งวดแล้ว      │
└─────────────────────────────────┘
```

**เหตุผลโปร่งใส (ต้องมี):**

- แสดง rationale การแนะนำ เช่น "47 ไม่ออกมา 8 งวดต่อเนื่อง (สถิติเฉลี่ยออกทุก 5 งวด)"
- Disclaimer ชัดเจน: "ข้อมูลนี้เป็นเพียงสถิติในอดีต ไม่ใช่การพยากรณ์"

**ส่วนที่ 2 — Quick Pick**

- ปุ่ม "สุ่มเลขตามสถิติ" — weighted random โดยให้น้ำหนักเลขที่ "ค้างนาน"
- ปุ่ม "รีเซ็ต" สุ่มใหม่

**ส่วนที่ 3 — ค้นหาเลขที่อยากรู้**

- Input: พิมพ์เลข 2 หรือ 3 ตัว
- Output: สถิติแบบย่อ — ออกกี่ครั้ง, ล่าสุดเมื่องวดไหน, ห่างกี่งวด, ranking

---

### 4.6 Archive Page

- List งวดย้อนหลัง pagination
- แต่ละงวด: expand ดูผลครบทุกรางวัล
- Filter ตามปี / เดือน

---

## 5. Mobile-First Layout

**Breakpoints:**

```
Mobile:  < 600px   — single column, bottom nav bar
Tablet:  600–960px — 2 columns, side nav hidden
Desktop: > 960px   — sidebar nav + multi-column grid
```

**Mobile Navigation:** bottom tab bar 5 items

```
[ หน้าแรก ] [ 2 ตัว ] [ 3 ตัว ] [ หลัก6ตัว ] [ แนะนำ ]
```

**Touch interactions:**

- Heatmap cell ขนาดขั้นต่ำ 44×44px
- Swipe ซ้าย/ขวาสลับ tab บน stats pages
- Long-press บน number card → share/copy เลข

---

## 6. Data Source & Refresh

### 6.1 แหล่งข้อมูล (ฟรีทั้งหมด)

| Source                                 | ใช้สำหรับ                       | วิธีเข้าถึง          |
| -------------------------------------- | ------------------------------- | -------------------- |
| `glo.or.th` API                        | ผลงวดล่าสุด                     | POST API ไม่ต้อง key |
| `gdcatalog.glo.or.th`                  | historical data อย่างเป็นทางการ | ดาวน์โหลด CSV ฟรี    |
| `github.com/heart/Data-Set-Thai-Lotto` | seed data ตอน setup             | open source CSV      |

**Strategy:** ใช้ GitHub CSV + Open Data CSV เป็น seed import เข้า Supabase ครั้งเดียว หลังจากนั้นดึงจาก glo.or.th API เพิ่มทีละงวด — ไม่ต้อง scrape เว็บภายนอกเลย

---

### 6.2 Auto-Update Pipeline

หวยออกวันที่ 1 และ 16 ของทุกเดือน เวลาประมาณ 15:00–15:30 น. ใช้ **Vercel Cron Job** ซึ่งอยู่ใน stack เดิมอยู่แล้ว

**Flow:**

```
Cron trigger (1 และ 16 ของเดือน เวลา 15:30 ไทย)
  → เรียก glo.or.th API ดึงผลงวดล่าสุด
  → INSERT ลง Supabase ตาราง draws
  → คำนวณสถิติใหม่ UPDATE ตาราง stats_cache
  → Revalidate Next.js cache
```

**Cron config:**

```js
// vercel.json
{
  "crons": [
    { "path": "/api/cron/fetch-latest", "schedule": "30 8 1,16 * *" }
    // UTC+7 = 15:30 ไทย → 08:30 UTC
  ]
}
```

> Vercel free tier รองรับ cron 2 ตัว — พอดีกับ 2 งวดต่อเดือน

**Retry logic (กันพลาดงวดออกช้า):**

```
ถ้าดึงมาแล้วยังไม่มีผล → retry ทุก 30 นาที สูงสุด 3 ครั้ง
ถ้ายังไม่ได้เลย → set flag manual_update_needed = true
             → แจ้งเตือนตัวเองผ่าน email / Line Notify
```

---

### 6.3 Database Schema (คร่าวๆ)

```sql
-- ข้อมูลดิบทุกงวด
draws (
  id, draw_date,
  first,           -- รางวัลที่ 1 (6 หลัก)
  last2,           -- เลขท้าย 2 ตัว
  last3f,          -- เลขหน้า 3 ตัว
  last3b,          -- เลขท้าย 3 ตัว
  ...
)

-- cache สถิติ คำนวณไว้ล่วงหน้า ไม่คำนวณใหม่ทุก request
stats_cache (
  stat_type,       -- เช่น "2digit_top", "digit_pos_1"
  scope,           -- เช่น "5y", "10y", "month_05"
  data_json,       -- ผลลัพธ์ที่คำนวณแล้ว
  computed_at
)
```

> `stats_cache` สำคัญมาก — การนับความถี่ย้อนหลัง 10 ปีถ้าคำนวณ realtime ทุก request จะช้า ควรคำนวณครั้งเดียวตอน INSERT แล้ว cache ไว้

---

### 6.4 Effort Estimate

| งาน                            | เวลา     |
| ------------------------------ | -------- |
| เขียน cron route + fetch logic | ~2 ชม.   |
| DB schema + insert logic       | ~1 ชม.   |
| stats_cache computation        | ~2–3 ชม. |
| Test + deploy                  | ~1 ชม.   |

ทำครั้งเดียว หลังจากนั้น auto ทุกงวด ไม่ต้องแตะมือ

---

## 7. Tech Stack

```
Frontend:   Nuxt.js 3 + TypeScript        (Vue 3 Composition API)
Styling:    Pure CSS (CSS Variables, BEM flat)
Charts:     Chart.js + vue-chartjs         (Vue-native, lightweight)
Database:   Supabase (เก็บ historical data + cache)
Deploy:     Vercel (Nitro preset: vercel)
Cron:       Vercel Cron Jobs               (Nitro server routes)
Cache:      Nuxt routeRules + isr: true    (เทียบเท่า Next.js ISR)
Rate Limit: Vercel Edge Middleware
Monitoring: Sentry (@sentry/nuxt)
Analytics:  Vercel Analytics
```

**Nuxt-specific notes:**

- Server routes อยู่ที่ `server/api/` — ใช้เป็น cron endpoint และ API layer
- `routeRules` ใน `nuxt.config.ts` ควบคุม ISR/cache แทน Next.js `revalidate`
- `@nuxtjs/supabase` module จัดการ client/server Supabase instance ให้อัตโนมัติ
- โปรเจกต์นี้แยก stack จาก Next.js โปรเจกต์อื่นโดยสมบูรณ์

---

## 8. Key UX Rules

1. **Filter ก่อนเสมอ** — ทุก page เริ่มด้วย filter state ที่ชัดเจน ไม่แสดงข้อมูล "ทั้งหมดตลอดกาล" เป็น default
2. **ตัวเลขต้องใหญ่** — เลขหวยคือ hero content ต้อง readable ใน 1 วินาที
3. **Disclaimer ทุก Advisor card** — ป้องกันความเข้าใจผิดว่าเป็นการพยากรณ์
4. **ไม่มี paywall บน stats พื้นฐาน** — ดูสถิติได้ฟรี, premium feature อาจเป็น export PDF / custom alert
5. **Performance** — First Contentful Paint < 1.5s บน mobile 4G (ใช้ static generation + ISR)
6. **ภาษาไทยเป็นหลัก** — UI ทั้งหมดเป็นภาษาไทย, optional English toggle

---

## 9. Component Inventory

```
/components
├── FilterBar/           — global filter controls
├── HeatmapGrid/         — 10×10 or 100-cell grid (keyboard navigable)
├── PodiumCard/          — top/bottom ranking card
├── DigitBarChart/       — single digit 0–9 frequency bar
├── SixDigitPanel/       — 6-column digit breakdown
├── LotteryTicketCard/   — advisor recommendation card
├── NumberSearch/        — lookup input + result
├── QuickPick/           — weighted random generator
├── ArchiveList/         — paginated draw history
├── DisclaimerBanner/    — required on advisor pages + page footer
├── LoadingSkeleton/     — placeholder ระหว่างรอ fetch data
├── ErrorCard/           — แสดงเมื่อ API/DB error พร้อมปุ่ม retry
└── EmptyState/          — แสดงเมื่อไม่มีข้อมูลในช่วงที่ filter เลือก
```

---

## 10. Future Features (Roadmap)

| Feature                         | Priority |
| ------------------------------- | -------- |
| แจ้งเตือนก่อนงวดออก (PWA push)  | High     |
| บันทึกเลขที่ชอบ (wishlist)      | Medium   |
| เปรียบเทียบ 2 เลข side by side  | Medium   |
| Export เลขแนะนำเป็น PDF ลายตั๋ว | Low      |
| Social share "เลขของฉันงวดนี้"  | Low      |
| Line OA Integration             | Low      |

---

## 11. Hot / Cold Thresholds

คำนิยามที่ใช้ทั่วทั้ง app — ต้องสอดคล้องกันทุก component

| Label    | เกณฑ์                                        | สี                 |
| -------- | -------------------------------------------- | ------------------ |
| 🔥 Hot   | ความถี่อยู่ใน **top 10%** ของช่วงที่เลือก    | `--accent-gold`    |
| 🧊 Cold  | ความถี่อยู่ใน **bottom 10%** ของช่วงที่เลือก | `--accent-green`   |
| — Normal | ระหว่าง 10%–90%                              | `--text-secondary` |

**สูตรคำนวณ:**

```
total_draws = จำนวนงวดในช่วงที่เลือก
expected_freq = total_draws / (จำนวนเลขที่เป็นไปได้)
  เช่น 2-ตัว = total_draws / 100

hot_threshold  = percentile(90, all_frequencies)
cold_threshold = percentile(10, all_frequencies)
```

> threshold คำนวณใหม่ทุกครั้งที่ filter เปลี่ยน ไม่ใช่ค่าตายตัว

---

## 12. Accessibility

**Heatmap keyboard navigation:**

- ใช้ `role="grid"` + `role="gridcell"` บน HeatmapGrid
- Arrow keys เลื่อน cell, `Enter`/`Space` = select
- Focus ring ใช้ `outline: 2px solid var(--accent-gold)`

**Color contrast (WCAG AA ขั้นต่ำ 4.5:1):**

| Pair                                                     | Contrast ratio | Pass?  |
| -------------------------------------------------------- | -------------- | ------ |
| `--accent-gold` (#F5C842) บน `--bg-surface` (#1A1A1A)    | ~9.1:1         | ✅ AAA |
| `--text-primary` (#F0EDE4) บน `--bg-base` (#0D0D0D)      | ~17.5:1        | ✅ AAA |
| `--text-secondary` (#9E9A90) บน `--bg-surface` (#1A1A1A) | ~5.2:1         | ✅ AA  |
| `--accent-red` (#E84040) บน `--bg-surface` (#1A1A1A)     | ~4.6:1         | ✅ AA  |

> ตรวจสอบซ้ำด้วย [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) ก่อน launch

**อื่นๆ:**

- ทุก chart ต้องมี `aria-label` อธิบายข้อมูล
- ปุ่ม icon-only ต้องมี `aria-label`
- DisclaimerBanner ต้องไม่ใช้สีเป็น signal เดียว

---

## 13. Disclaimer Placement

| ตำแหน่ง                                   | เหตุผล                                |
| ----------------------------------------- | ------------------------------------- |
| ทุก LotteryTicketCard (advisor)           | ผู้ใช้เห็นทันทีที่ดูเลขแนะนำ          |
| Page footer ทุกหน้า                       | ครอบคลุม legal compliance             |
| หน้า Number Advisor — sticky bar ด้านล่าง | เน้นซ้ำในหน้าที่เสี่ยงเข้าใจผิดสูงสุด |

**ข้อความ disclaimer มาตรฐาน:**

> "ข้อมูลทั้งหมดเป็นสถิติจากผลการออกรางวัลในอดีต ไม่ใช่การพยากรณ์หรือรับประกันผลรางวัล สลากกินแบ่งรัฐบาลเป็นการเสี่ยงโชค โปรดใช้วิจารณญาณในการตัดสินใจ"

---

## 14. Pre-Dev Checklist

ทำก่อนเริ่มเขียนโค้ดจริง

- [ ] ทดสอบ `glo.or.th` API — บันทึก request/response format จริง
- [ ] ดาวน์โหลด CSV จาก GDCatalog — verify column names และ data types
- [ ] ออกแบบ DB schema เต็มพร้อม indexes และ constraints
- [ ] กำหนด cache key strategy และ invalidation rules
- [ ] ตัดสินใจ Chart.js vs CSS-only แต่ละ chart type
- [ ] ตรวจสอบ contrast ratio ทุก color pair ด้วย tool จริง
- [ ] ทดสอบ Vercel Cron บน preview environment ก่อน production

---

## 15. CSS Variables (variables.css)

```css
/* ============================================================
   Lotty — variables.css
   Single source of truth. ห้ามใส่ hardcode ใน file อื่น
   ============================================================ */

:root {
  /* ----------------------------------------------------------
     Color
  ---------------------------------------------------------- */

  --bg-base: #0d0d0d;
  --bg-surface: #1a1a1a;
  --bg-raised: #242424;

  --accent-gold: #f5c842;
  --accent-red: #e84040;
  --accent-green: #3dba6a;
  --accent-dim: #5a5a5a;

  --text-primary: #f0ede4;
  --text-secondary: #9e9a90;

  --border: #2e2e2e;
  --glow-gold: rgba(245, 200, 66, 0.15);

  /* ----------------------------------------------------------
     Typography — Fonts
  ---------------------------------------------------------- */

  --font-display: "Teko", sans-serif; /* ตัวเลขใหญ่ / หัว */
  --font-body: "Sarabun", sans-serif; /* UI ภาษาไทยทั่วไป */
  --font-mono: "JetBrains Mono", monospace; /* ตัวเลขสถิติ */

  /* ----------------------------------------------------------
     Typography — Size Scale (5 ขนาด)
     clamp(min, preferred-vw, max)
     min = mobile floor, vw = fluid, max = desktop ceiling
  ---------------------------------------------------------- */

  --text-xs: clamp(11px, 1.2vw, 12px); /* label เล็ก, disclaimer */
  --text-sm: clamp(13px, 1.4vw, 14px); /* caption, secondary text */
  --text-md: clamp(15px, 1.6vw, 16px); /* body หลัก, UI default */
  --text-lg: clamp(18px, 2vw, 20px); /* subheading, card title */
  --text-xl: clamp(28px, 3.5vw, 40px); /* ตัวเลขหวย, hero number */

  /* ----------------------------------------------------------
     Typography — Weight
  ---------------------------------------------------------- */

  --weight-regular: 400;
  --weight-medium: 500;
  --weight-bold: 700;

  /* ----------------------------------------------------------
     Typography — Line Height
  ---------------------------------------------------------- */

  --leading-tight: 1.2; /* display / ตัวเลขใหญ่ */
  --leading-normal: 1.5; /* body ทั่วไป */
  --leading-loose: 1.75; /* อ่านยาว / paragraph */

  /* ----------------------------------------------------------
     Spacing Scale — fixed px
     base grid: 5 10 15 30 50
  ---------------------------------------------------------- */

  --gap-xs: 5px; /* gap เล็ก, icon padding */
  --gap-sm: 10px; /* inner padding card */
  --gap-md: 15px; /* section gap เล็ก */
  --gap-lg: 30px; /* section gap หลัก */
  --gap-xlg: 50px; /* page padding, hero gap */

  /* ----------------------------------------------------------
     Border
  ---------------------------------------------------------- */

  --border-width: 1px;
  --border-style: solid;
  --border-color: var(--border);
  --border-color-strong: var(--accent-dim);

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* ----------------------------------------------------------
     Shadow / Glow
  ---------------------------------------------------------- */

  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.4);
  --shadow-raised: 0 4px 16px rgba(0, 0, 0, 0.6);
  --glow-hot: 0 0 12px var(--glow-gold);

  /* ----------------------------------------------------------
     Transition
  ---------------------------------------------------------- */

  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;

  /* ----------------------------------------------------------
     Layout
  ---------------------------------------------------------- */

  --nav-height-mobile: 56px;
  --nav-width-desktop: 220px;
  --content-max-width: 1200px;

  --bp-mobile: 600px;
  --bp-desktop: 960px;
}
```

---

## 16. Database Schema (Full)

```sql
-- =========================================================
-- draws — ข้อมูลดิบทุกงวด
-- =========================================================
CREATE TABLE draws (
  id           SERIAL PRIMARY KEY,
  draw_date    DATE        NOT NULL UNIQUE,
  first        CHAR(6)     NOT NULL,   -- รางวัลที่ 1
  last2        CHAR(2)     NOT NULL,   -- เลขท้าย 2 ตัว
  last3f       CHAR(3)     NOT NULL,   -- เลขหน้า 3 ตัว
  last3b       CHAR(3)     NOT NULL,   -- เลขท้าย 3 ตัว
  second       CHAR(6)[]   NOT NULL,   -- รางวัลที่ 2 (5 รางวัล)
  third        CHAR(6)[]   NOT NULL,   -- รางวัลที่ 3 (10 รางวัล)
  fourth       CHAR(6)[]   NOT NULL,   -- รางวัลที่ 4 (50 รางวัล)
  fifth        CHAR(6)[]   NOT NULL,   -- รางวัลที่ 5 (100 รางวัล)
  near1        CHAR(6)[]   NOT NULL,   -- รางวัลข้างเคียงที่ 1 (2 รางวัล)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_draws_date    ON draws (draw_date DESC);
CREATE INDEX idx_draws_last2   ON draws (last2);
CREATE INDEX idx_draws_last3b  ON draws (last3b);
CREATE INDEX idx_draws_first   ON draws (first);

-- =========================================================
-- stats_cache — ผลสถิติที่คำนวณไว้ล่วงหน้า
-- =========================================================
CREATE TABLE stats_cache (
  id           SERIAL PRIMARY KEY,
  stat_type    TEXT        NOT NULL,
  -- เช่น '2digit_top', '3digit_top', 'digit_pos_1', 'digit_pos_6'
  scope        TEXT        NOT NULL,
  -- เช่น '1y', '3y', '5y', '10y', 'all', 'month_05', 'day_01'
  data_json    JSONB       NOT NULL,
  computed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_stats UNIQUE (stat_type, scope)
);

CREATE INDEX idx_stats_lookup ON stats_cache (stat_type, scope);

-- =========================================================
-- RLS — public read, service role write only
-- =========================================================
ALTER TABLE draws       ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read draws"
  ON draws FOR SELECT USING (true);

CREATE POLICY "public read stats"
  ON stats_cache FOR SELECT USING (true);

-- INSERT/UPDATE ทำผ่าน service role key เท่านั้น (cron)
```

**Cache key convention:**

```
stat_type + ':' + scope
เช่น  "2digit_top:5y"
      "digit_pos_3:10y"
      "3digit_top:month_05"
      "2digit_top:all"
```

---

## 17. API Contract

Base URL: `/api/`
Response shape ทุก endpoint:

```ts
{ data: T, cached_at: string } | { error: string, code: number }
```

---

### GET /api/stats/2digit

สถิติเลข 2 ตัว

**Query params:**
| param | type | default | ตัวเลือก |
|---|---|---|---|
| `scope` | string | `5y` | `1y` `3y` `5y` `10y` `all` |
| `type` | string | `last2` | `last2` `first2` |
| `month` | number? | — | `1`–`12` |

**Response:**

```ts
{
  data: {
    ranking: Array<{
      number: string; // "00"–"99"
      count: number;
      last_draw: string; // ISO date
      gap: number; // งวดที่ผ่านมาตั้งแต่ออกล่าสุด
      pct: number; // % relative frequency
      label: "hot" | "cold" | "normal";
    }>;
    total_draws: number;
    hot_threshold: number;
    cold_threshold: number;
  }
  cached_at: string;
}
```

---

### GET /api/stats/3digit

สถิติเลข 3 ตัว

**Query params:**
| param | type | default | ตัวเลือก |
|---|---|---|---|
| `scope` | string | `5y` | `1y` `3y` `5y` `10y` `all` |
| `type` | string | `last3b` | `last3b` `last3f` |
| `month` | number? | — | `1`–`12` |

**Response:** เหมือน 2digit แต่ `number` เป็น `"000"`–`"999"`

---

### GET /api/stats/digits

สถิติแยกหลัก (รางวัลที่ 1)

**Query params:**
| param | type | default |
|---|---|---|
| `scope` | string | `5y` |
| `pos` | number? | — | ถ้าไม่ส่ง = ส่งกลับทุก 6 หลัก |

**Response:**

```ts
{
  data: Array<{
    position: 1 | 2 | 3 | 4 | 5 | 6   // หลักแสน → หน่วย
    freq: Record<"0"|"1"|...|"9", number>
    hot_digit:  string
    cold_digit: string
  }>
  cached_at: string
}
```

---

### GET /api/stats/lookup

ค้นหาสถิติของเลขที่กำหนด

**Query params:**
| param | type |
|---|---|
| `number` | string | เลข 2 หรือ 3 หลัก |
| `scope` | string | default `5y` |

**Response:**

```ts
{
  data: {
    number: string;
    count: number;
    last_draw: string;
    gap: number;
    rank: number; // อันดับในกลุ่ม (1 = บ่อยสุด)
    total: number; // จำนวนเลขทั้งหมดในกลุ่ม
    label: "hot" | "cold" | "normal";
    history: Array<{ draw_date: string }>;
  }
  cached_at: string;
}
```

---

### GET /api/advisor

เลขแนะนำงวดปัจจุบัน

**Query params:**
| param | type | default |
|---|---|---|
| `scope` | string | `5y` |

**Response:**

```ts
{
  data: {
    draw_date_next: string     // งวดถัดไป (ISO date)
    suggestions: {
      last2:  { number: string, gap: number, avg_gap: number }
      last3b: { number: string, gap: number, avg_gap: number }
      last3f: { number: string, gap: number, avg_gap: number }
    }
    rationale: string          // ข้อความอธิบายเหตุผล ภาษาไทย
  }
  cached_at: string
}
```

---

### POST /api/cron/fetch-latest

เรียกโดย Vercel Cron เท่านั้น — ต้องมี `Authorization: Bearer CRON_SECRET`

**Body:** ไม่มี

**Flow:**

1. เรียก `glo.or.th` API ดึงผลงวดล่าสุด
2. เช็คว่า `draw_date` ซ้ำใน `draws` หรือไม่
3. INSERT ถ้าใหม่
4. คำนวณ stats_cache ทุก scope ที่ได้รับผลกระทบ
5. Revalidate `/api/stats/*` และ `/api/advisor`

**Response:**

```ts
{ status: "inserted" | "already_exists" | "not_ready", draw_date: string }
```

---

## 18. Component Props

### HeatmapGrid

```ts
interface HeatmapGridProps {
  data: Array<{ number: string; count: number; label: "hot" | "cold" | "normal" }>;
  onSelect: (number: string) => void;
  selected: string | null;
}
```

- `role="grid"` + `role="gridcell"` ทุก cell
- Arrow key navigation
- Tab เข้า grid → arrow เดิน, Escape ออก

---

### PodiumCard

```ts
interface PodiumCardProps {
  number: string;
  count: number;
  pct: number;
  last_draw: string;
  gap: number;
  rank: number;
  label: "hot" | "cold" | "normal";
}
```

---

### DigitBarChart

```ts
interface DigitBarChartProps {
  position: 1 | 2 | 3 | 4 | 5 | 6;
  freq: Record<string, number>; // { "0": 12, "1": 8, ... }
  hot_digit: string;
  cold_digit: string;
}
```

---

### LoadingSkeleton

```ts
interface LoadingSkeletonProps {
  variant: "heatmap" | "podium" | "chart" | "ticket";
  rows?: number; // default 5 สำหรับ podium
}
```

---

### ErrorCard

```ts
interface ErrorCardProps {
  message: string;
  onRetry?: () => void;
}
```

---

### EmptyState

```ts
interface EmptyStateProps {
  reason: "no_data_in_range" | "no_search_result";
  scope?: string; // แสดงใน message เช่น "ไม่พบข้อมูลในช่วง 1 ปีที่เลือก"
}
```

---

### LotteryTicketCard

```ts
interface LotteryTicketCardProps {
  draw_date_next: string;
  suggestions: AdvisorSuggestions; // จาก /api/advisor response
  rationale: string;
  scope: string;
}
```

---

### NumberSearch

```ts
interface NumberSearchProps {
  onResult: (result: LookupResult | null) => void;
  scope: string;
}
```

---

### QuickPick

```ts
interface QuickPickProps {
  scope: string;
}
// internal state: picks: { last2, last3b, last3f }
// weighted random โดยใช้ gap เป็น weight — ยิ่งค้างนาน weight ยิ่งสูง
```
