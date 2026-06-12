# CSS Optimization Pattern

## Guidelines

1. **Find duplicate classes** - Search for classes that are duplicated across different files and consolidate them into one location
2. **Create base classes** - For components with multiple variants (e.g., badge, avatar)
   - Put common properties in the base class
   - Put variant-specific properties in modifier classes
3. **Use compact format** - For variants that only have color/background, write on a single line

```css
.variant { background: var(--x); color: var(--y); }
```

4. **Use CSS variables** - For values that are used frequently (sizes, colors, spacing)
5. **Combine similar patterns** - e.g., flex layouts, padding, border-radius

## Don't

- Don't create Tailwind-style utility classes (e.g., `.flex`, `.text-center`)
- Continue using BEM naming convention
- Keep semantic class names
- **Don't change values in variables.css without permission** - Ask before modifying existing variable values

## Checklist

- [ ] All `margin` values must use `var(--gap-*)` from variables.css
- [ ] All `padding` values must use `var(--gap-*)` from variables.css
- [ ] All `font-size` values must use `var(--text-*)` from variables.css
- [ ] All `font-weight` values must use `var(--weight-*)` from variables.css
- [ ] All `border-radius` values must use `var(--radius-*)` from variables.css
- [ ] All `color` values must use CSS variables from variables.css
- [ ] All `background` values must use CSS variables from variables.css
- [ ] No hardcoded values (px, rem, em) except in variables.css
- [ ] All spacing, sizing, and colors should be defined in variables.css first
- [ ] **Ask before creating new CSS variables** - Consult with team before adding new variables to variables.css

## Exceptions

- **Values < 10px** - Hardcoded values less than 10px are allowed (e.g., `2px`, `4px`, `6px`)
- **Position properties** - `top`, `right`, `left`, `bottom` can use hardcoded values

## Example

```css
/* Instead of writing like this */
.component-variant-a { background: var(--x); color: var(--y); border-radius: var(--z); padding: 2px; }
.component-variant-b { background: var(--a); color: var(--b); border-radius: var(--z); padding: 2px; }

/* Write like this */
.component-base { border-radius: var(--z); padding: 2px; }
.component-variant-a { background: var(--x); color: var(--y); }
.component-variant-b { background: var(--a); color: var(--b); }
```