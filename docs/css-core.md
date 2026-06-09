# CSS Core Documentation

## Overview

This project uses a modular CSS architecture with Nuxt.js. Styles are organized into reusable modules and component-scoped styles.

## CSS Architecture

### Entry Point

**Configuration**: `nuxt.config.ts` (line 21)

```typescript
css: ["~/assets/style/main.css"];
```

### Main CSS Structure

**File**: `assets/style/main.css`

```css
/* Base Styles */
@import "./variables.css";
@import "./reset.css";
@import "./shared.css";

/* Components */
@import "./button.css";
@import "./form.css";
@import "./status.css";
@import "./pagination.css";
@import "./filter.css";
@import "./widget.css";

/* Layout */
@import "./table.css";
@import "./lightmode.css";
```

## CSS Modules

### 1. Variables (`assets/style/variables.css`)

Defines CSS custom properties for consistent theming:

**Colors**

- `--bg-base`, `--bg-surface`, `--bg-raised` - Background colors
- `--bg-sidebar` - Sidebar background
- `--text-primary`, `--text-secondary`, `--text-muted` - Text colors
- `--accent`, `--accent-hover`, `--accent-light` - Primary accent
- `--accent-gold`, `--accent-gold-light` - Gold accent
- `--accent-red`, `--accent-red-light` - Error states
- `--accent-green`, `--accent-green-light` - Success states
- `--border`, `--border-strong` - Border colors

**Typography**

- `--font-display: "Teko", sans-serif`
- `--font-body: "Sarabun", sans-serif`
- `--font-mono: "JetBrains Mono", monospace`
- `--text-xs`, `--text-sm`, `--text-md`, `--text-lg`, `--text-xl` - Font sizes (clamp-based)
- `--weight-regular: 400`, `--weight-medium: 500`, `--weight-bold: 700`

**Spacing**

- `--gap-xs: 5px`
- `--gap-sm: 10px`
- `--gap-md: 15px`
- `--gap-lg: 30px`
- `--gap-xlg: 50px`

**Layout**

- `--nav-height-mobile: 56px`
- `--nav-width-desktop: 64px`
- `--topbar-height: 56px`
- `--content-max-width: 1400px`
- `--radius-xs` ~ `--radius-full` - Border radius scale
- `--transition-fast: 150ms ease`, `--transition-normal: 250ms ease`

**Usage**

```css
.my-element {
  background: var(--bg-surface);
  padding: var(--gap-md);
  border-radius: var(--radius-md);
}
```

### 2. Reset (`assets/style/reset.css`)

Base styles and browser resets:

- Box-sizing border-box
- Margin/padding reset
- Font family: `var(--font-body)` (Sarabun)
- Form element resets (button, input, select, textarea)
- List style reset
- Table border collapse

### 3. Shared (`assets/style/shared.css`)

Layout patterns and shell classes:

**Layout Classes**

- `.page-header` - Page header with border
- `.page-title` - Page title (display font)
- `.page-subtitle` - Page subtitle
- `.section-title` - Section heading

**Grid Helpers**

- `.page-grid` - Base grid (1 column)
- `.page-grid-2` - 2 columns (≥600px)
- `.page-grid-3` - 3 columns (≥960px)

**Responsive**

- Mobile: `< 960px`
- Desktop: `≥ 960px`

### 4. Component Modules

**Button** (`button.css`) - Button styles and variants
**Form** (`form.css`) - Form inputs and controls
**Status** (`status.css`) - Status indicators
**Pagination** (`pagination.css`) - Pagination controls
**Filter** (`filter.css`) - Filter components
**Widget** (`widget.css`) - Widget components
**Table** (`table.css`) - Table styles
**Lightmode** (`lightmode.css`) - Light theme overrides

## Component Styling

### Scoped CSS

Vue components use `<style scoped>` for component-specific styles:

```vue
<template>
  <div class="sidebar">...</div>
</template>

<style scoped>
.sidebar {
  display: flex;
  background: var(--bg-surface);
}
</style>
```

### Common Patterns

**Flexbox Layout**

```css
.sidebar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--gap-md);
}
```

**Responsive Design**

```css
@media screen and (max-width: 960px) {
  .sidebar {
    transform: translateX(-100%);
  }
}
```

**Dynamic Values**

```css
padding: calc(var(--gap-sm) * 1.5);
```

## Adding New Styles

### 1. Add Global CSS Variable

Edit `assets/style/variables.css`:

```css
:root {
  --my-new-color: #hexcode;
}
```

### 2. Add New Component Module

Create file in `assets/style/` (e.g., `card.css`):

```css
.card {
  background: var(--bg-surface);
  border-radius: var(--radius-md);
}
```

Import in `assets/style/main.css`:

```css
@import "./card.css";
```

### 3. Add Component Styles

Add `<style scoped>` to Vue component:

```vue
<style scoped>
.my-component {
  /* styles */
}
</style>
```

## Best Practices

1. **Use CSS Variables** - Always use variables for colors, spacing, sizes
2. **Scoped Styles** - Use `<style scoped>` for component-specific styles
3. **Responsive First** - Use media queries for mobile/desktop
4. **Consistent Spacing** - Use gap variables instead of fixed values
5. **Accessibility** - Include focus states for interactive elements
6. **Performance** - Avoid deep nesting, prefer flat selectors
