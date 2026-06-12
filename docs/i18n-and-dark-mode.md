# i18n and Dark Mode Documentation

## i18n (Internationalization)

### Overview
Lotty supports English (EN) and Thai (TH) languages with a custom translation system built with Vue 3 composables.

### How to Use

#### 1. Import the composable
```vue
<script setup lang="ts">
import { useLanguage } from "~/composables/useLanguage";

const { t, locale, toggleLocale, initLocale } = useLanguage();
</script>
```

#### 2. Use the translation function
```vue
<template>
  <h1>{{ t('results.latest') }}</h1>
  <p>{{ t('quickpick.desc') }}</p>
  <button>{{ t('filter.search') }}</button>
</template>
```

#### 3. Dynamic parameters
Some translations support dynamic parameters:
```vue
<template>
  <p>{{ t('ticket.title', { date: '2024-01-16' }) }}</p>
  <p>{{ t('archive.page', { p: 1 }) }}</p>
  <p>{{ t('combo.lockAria', { pos: 1, digit: 5 }) }}</p>
</template>
```

### Translation Keys

Translation keys are organized by category:
- `nav.*` - Navigation items
- `title.*` / `sub.*` - Page titles and subtitles
- `results.*` - Lottery results labels
- `quickpick.*` - Quick pick feature
- `lookup.*` - Number statistics lookup
- `combo.*` - Combo finder
- `breakdown.*` - Digit breakdown charts
- `archive.*` - Archive page
- `search.*` / `table.*` - Search and table labels
- `filter.*` - Filter bar options
- `ticket.*` - Lottery ticket card
- `empty.*` - Empty state messages
- `error.*` - Error messages

### Adding New Translations

1. Add the key to `composables/useLanguage.ts`:
```typescript
const translations: Record<string, { en: string; th: string }> = {
  "your.key": { en: "English text", th: "ข้อความภาษาไทย" },
  // ...
};
```

2. Use it in your component:
```vue
<template>
  {{ t('your.key') }}
</template>
```

### Language Toggle

The language toggle button is located in the topbar next to the dark mode toggle in `layouts/default.vue`. It:
- Switches between EN and TH
- Persists the preference in localStorage
- Auto-detects browser language on first visit

## Dark Mode

### Overview
Lotty supports dark mode with CSS variable overrides and localStorage persistence.

### How It Works

1. **CSS Variables**: Dark mode overrides are defined in `assets/style/variables.css`:
```css
.dark {
  --bg-base: #0a0813;
  --text-primary: #ececf5;
  /* ...other overrides... */
}
```

2. **Toggle Logic**: In `layouts/default.vue`:
```typescript
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
```

3. **Initialization**: On mount, the theme is initialized from localStorage or system preference:
```typescript
onMounted(() => {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    isDark.value = true;
    document.documentElement.classList.add("dark");
  } else {
    isDark.value = false;
    document.documentElement.classList.remove("dark");
  }
});
```

### Adding Dark Mode Support to New Components

When creating new components, use CSS variables instead of hardcoded colors:

```css
/* ✅ Good - uses CSS variables */
.my-component {
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

/* ❌ Bad - hardcoded colors */
.my-component {
  background: #ffffff;
  color: #1a1a2e;
  border: 1px solid #e0e0e0;
}
```

### Available CSS Variables

See `assets/style/variables.css` for the complete list of variables:
- `--bg-*` - Background colors (base, surface, raised, hover, blur)
- `--text-*` - Text colors (primary, secondary, muted)
- `--border` - Border color
- `--accent-*` - Accent colors (primary, gold, danger, green)
- `--shadow-*` - Shadows
- `--transition-*` - Transition durations

## Testing

### Testing i18n
1. Click the language toggle button (TH/EN) in the topbar
2. Verify all text switches between English and Thai
3. Check that dynamic parameters render correctly
4. Test across all pages and components

### Testing Dark Mode
1. Click the dark mode toggle button (☀️/🌙) in the topbar
2. Verify colors switch appropriately
3. Check that all components use CSS variables
4. Test that localStorage persists the preference
5. Test that system preference detection works on first visit

## Performance Considerations

- The i18n system uses a simple dictionary lookup with O(1) complexity
- Translations are computed on-demand and cached by Vue's reactivity system
- No external i18n library dependencies
- Dark mode uses CSS variables which are performant and don't require JavaScript re-renders
