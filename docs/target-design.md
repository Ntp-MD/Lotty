# Dashboard UI Design Spec — Finance/Project Dashboard

## Layout
- Container: rounded card (radius ~24px), white background, centered with soft gradient blur background (peach/purple blobs)
- Structure: 3-column layout
  - Left: icon sidebar (vertical nav)
  - Center-left: balance + tasks + active users + project list
  - Center-right: charts (earnings, team activity, traffic)
  - Right: search/icons, statistics, earning categories, members

## Color Palette
- Background blur: gradient peach `#FFD8C2` → purple `#C9B8F5`
- Card background: `#FFFFFF`
- Primary accent (purple): `#6C5CE7` / `#7B68EE`
- Secondary accent (orange): `#F4A259` / `#FF8C42`
- Text primary: `#1A1A2E` / `#252540`
- Text secondary/muted: `#A0A0B8`
- Success/green: `#27C28B`
- Card dark (Tasks Overview): `#1E1E3F` gradient to `#2D2D5A`
- Borders/dividers: `#F0F0F5`

## Typography
- Font family: Inter / Poppins / similar geometric sans-serif
- Headings (e.g. "Earnings", "Project"): 600 weight, ~16px
- Big number ("$5,90.80"): 700 weight, ~36px, decimal portion lighter
- Body/labels: 400-500 weight, ~12-13px
- Small/meta text (timestamps, days): 11px, `#A0A0B8`

## Spacing & Tokens
```css
:root {
  --gap-xs: 4px;
  --gap-sm: 8px;
  --gap-md: 16px;
  --gap-lg: 24px;
  --gap-xl: 32px;

  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;

  --color-bg: #FFFFFF;
  --color-primary: #6C5CE7;
  --color-secondary: #F4A259;
  --color-success: #27C28B;
  --color-text: #1A1A2E;
  --color-text-muted: #A0A0B8;
  --color-dark-card: #1E1E3F;
  --color-border: #F0F0F5;
}
```

## Sidebar (left, ~64px wide)
- Vertical stack of icon buttons (~24px icons)
- Items top to bottom: logo (purple gradient circle), compass, checkbox, calendar, layout/grid, profile
- Active state: subtle left indicator bar, active icon color `--color-primary`
- Inactive icon color: `--color-text-muted`

## Section: Current Amount (top-left)
- Label "Current Amount" — muted, 13px
- Value "$5,90.80" — large bold (36px), decimal portion lighter weight/muted color
- Below row:
  - Green pill badge "↗ +08% Mar"
  - "Withdraw all Earning" link with icon

## Section: Tasks Overview (dark feature card)
- Background: dark navy/purple gradient (`--color-dark-card` → `#2D2D5A`)
- Top-left: progress badge "37%" (small rounded pill)
- Top-right: overlapping avatar group icon
- Title "Tasks Overview" — white, bold
- Subtitle "tasks activity" — muted white
- Sub-label: project name "Medicos - App Design"
- Bottom: thin rounded progress bar, partially filled

## Section: Active Users
- Circular progress ring (purple stroke), "75%" centered inside
- Title "Active Users", subtitle "visitors overview"
- Row of 4-5 overlapping circular avatars (varied colors)
- Bottom-center: collapse/expand chevron

## Section: Project List
- Header "Project" + "VIEW ALL" link (top-right, muted, uppercase, small)
- Row item structure:
  - App icon (rounded square, brand-colored background)
  - Title (bold) + subtitle "by [Name]" (muted)
  - Trailing meta (right-aligned): time ago, comment icon + count, heart icon + count
- Items: Firefox Branding (by Ramotion), Instagram (by Sheree Dillon, with lock icon)

## Section: Earnings Chart
- Header "Earnings" + legend (Income = purple dot, Expense = orange dot) + dropdown "Last 7 day's ⌄"
- Dual-line area chart, smooth curves
  - Income line: `--color-primary`, gradient fill below
  - Expense line: `--color-secondary`, gradient fill below
- Y-axis: $0k–$6k, 1k steps
- X-axis: Mon–Sun

## Section: Teams Activity Chart
- Header "Teams Activity" + dropdown "Last 30 day's ⌄"
- Single jagged/zigzag line chart, `--color-primary` stroke, no fill
- Y-axis: $0k–$6k
- X-axis: Mon–Sun

## Section: Traffic Channel
- Above header: green badge "+1.90%"
- Header "Traffic Channel" + dropdown "Month ⌄"
- Legend: Direct (purple dot) / Organic Search (dark dot)
- Vertical dual-series bar chart (purple + dark bars per category)
- Tooltip example: "Direct 4.5K / Search 506"
- X-axis: Jul–Dec

## Right Panel — Top Icon Row
- 4 circular icon buttons, outlined/muted style
- Icons: search, chat/message, bookmark/save, settings/gear
- Hover state: light gray circular background

## Section: Statistics
- Header "Statistics" + "···" overflow menu icon
- Two stat cards side by side (white bg, bordered, rounded):
  - Card 1: purple bar-chart icon + value "15,980" + label "Income"
  - Card 2: orange bar-chart icon + value "4,324" + label "Expense"

## Section: Earning By Categories
- Header "Earning By Categories" + "VIEW ALL" link
- List rows:
  - Icon (rounded square, category-colored bg: orange/red/blue)
  - Title (bold) + subtitle (person name, muted)
  - Trailing amount (bold, right-aligned)
- Items:
  - Wireframe kits — Jacob Morales — $542 (orange icon)
  - Illustrations — Cimpanzee — $34 (red icon)
  - User Interface — Squirrelant — $621 (blue icon)

## Section: 28 Members
- Header "28 Members" + "VIEW ALL" link
- Grid of circular illustrated avatars, 2 rows × 6 columns, varied colors

## Component Inventory
- `StatCard` — icon + value + label
- `ChartCard` — header + legend + dropdown + chart area
- `ListItemRow` — icon/avatar + title/subtitle + trailing value/meta
- `AvatarGroup` — overlapping circular avatars
- `ProgressRing` — circular %, centered label
- `DarkFeatureCard` — gradient bg, progress bar, badge, avatar group
- `SidebarNav` — vertical icon list with active state
- `IconButtonRow` — top-right utility icon buttons