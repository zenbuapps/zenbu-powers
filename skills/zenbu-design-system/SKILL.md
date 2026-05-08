---
name: zenbu-design-system
description: Zenbu Apps (zenbu-cms, zb-cart, all Zenbu modules) unified design system. Use when building or reviewing admin dashboard UI — pages, components, layout structures, or design tokens (color/typography/spacing/border-radius/shadow). Triggers: admin UI, dashboard, page layout, design tokens, sidebar, batch select, action bar, WCAG, accessibility, QA checklist, Zenbu UI, zenbu-cms, zb-cart. Component / pattern / QA detail in references.
user-invocable: false
---

# Zenbu Design System

Implementation-ready design system for all Zenbu admin dashboard modules (zenbu-cms, zb-cart, future modules). Extracted from the live production UI.

## Reference Files

- **[tokens.md](tokens.md)** — Color palette (CSS custom properties), typography scale, spacing, border-radius, shadows, z-index
- **[layout.md](layout.md)** — Shell structure, sidebar navigation, page headers, list/detail/settings page grid patterns, responsive breakpoints
- **[components.md](components.md)** — Buttons (5 variants), cards, tables, tabs, form inputs, badges, toggles, dropdowns, stat cards, iconography
- **[patterns.md](patterns.md)** — Batch select bar (canonical `/zb-cart/products` standard), fixed bottom action bar, filter bar
- **[qa-checklist.md](qa-checklist.md)** — Accessibility requirements, anti-patterns (prohibited implementations), implementation QA checklist

## Core Principles

1. **CSS Custom Properties only**: all colors reference `var(--color-*)`. Raw hex values are prohibited in component code.
2. **Consistent radius**: cards use `rounded-xl` (12px), buttons/inputs use `rounded-lg` (8px). Never mix.
3. **Typography hierarchy**: only use font weights 400, 500, 600, 700 with the defined scale (11px–24px).
4. **Spacing scale**: only use defined tokens (4/6/8/10/12/16/20/24 px). No one-off values.
5. **Sidebar-aware fixed bars**: all `fixed bottom-0` elements must offset with `left-[220px]` on desktop (lg+).
6. **Accessibility first**: WCAG 2.2 AA, visible focus rings, semantic HTML elements, ARIA roles on tabs/toggles.
7. **Batch select standard**: `/zb-cart/products` is the canonical reference — other pages will be updated to match.

## Quick Token Reference

```css
--color-brand:          #2563eb;   /* primary actions, links */
--color-text-primary:   #111827;   /* headings, body */
--color-text-secondary: #374151;   /* secondary text, nav */
--color-text-muted:     #6b7280;   /* placeholders, helpers */
--color-surface:        #f9fafb;   /* page background */
--color-surface-overlay:#f3f4f6;   /* hover states */
--color-border:         #e5e7eb;   /* all borders */
--color-error:          #ef4444;   /* destructive actions */
--color-success:        #22c55e;   /* success states */
```

```
Font: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", sans-serif
Radius: 4 | 6 | 8 | 12 | 9999 px
Spacing: 4 | 6 | 8 | 10 | 12 | 16 | 20 | 24 px
```
