# Code Review: `feat/landing-page`

**Branch:** `feat/landing-page` → `develop`  
**Reviewer:** Antigravity  
**Date:** 2026-02-23  
**Files changed:** 15 (14 added, 1 modified) — +1 142 / −1 lines

---

## Summary

This branch introduces a landing page built on a new custom component system. It adds `BaseComponent` (a DOM wrapper), reusable UI primitives (`Button`, `Link`, `Header`, `ThemeSwitcher`), a localization module, SVG icon assets, shared type definitions, and documentation.

**Overall impression:** Solid foundation — clean BEM naming, good separation of concerns, and proper event-listener cleanup. There are several issues worth addressing before merging.

---

## Critical Issues

### 1. Commented-out code left in `app.ts`

```typescript
// this.parentNode.innerHTML = "<h1>App</h1>";
```

Dead code should be removed before merging. Git history preserves the old version.

---

### 2. `node` property is `public readonly` — `base-component.ts:4`

```typescript
public readonly node: T;
```

The entire component system relies on consumers accessing `.node` directly, but there's also a `getNode()` method. This creates two ways to do the same thing, which hurts consistency.

**Suggestion:** Choose one approach. If `node` stays public, remove `getNode()`. If encapsulation is important, make `node` protected and keep `getNode()`.

---

## Medium Priority

### 3. Missing return type on `createHeader()` — `landing-page.ts:27`

```typescript
private createHeader() {
```

All other `create*` methods have explicit return types (`BaseComponent`). This one is missing — likely an oversight.

---

### 4. `header` field stored but never used — `landing-page.ts:9`

```typescript
private header!: BaseComponent;
```

The `header` instance is assigned in `createHeader()` but never referenced afterwards. If there's no plan to interact with the header post-creation, remove the field and just return `new Header()`.

---

### 5. Hardcoded strings in `Header` — `header.ts`

The logo text `"</>"` and `"codeVibeCheck"` are hardcoded, while other UI text correctly uses the `EN` locale object. Move these into `en.ts` for consistency.

```typescript
// header.ts:40
text: "</>",    // → EN.common.logo.icon
// header.ts:47
text: "codeVibeCheck",  // → EN.common.logo.text
```

---

### 6. `hero__code` snippets are hardcoded — `landing-page.ts:55–65`

```typescript
text: "const sum = (a, b) => a + b;",
text: "type User = { id: string }",
```

These decorative code snippets should be in `en.ts` (or a separate config) to keep the component locale-agnostic.

---

### 7. Magic number `20` in scroll handler — `header.ts:83`

```typescript
this.toggleClass("header--scrolled", window.scrollY > 20);
```

Extract to a named constant (`SCROLL_THRESHOLD`) for readability.

---

### 8. `ThemeSwitcher` duplicates theme restoration logic — `theme-switcher.ts:42`

```typescript
const current = localStorage.getItem("app-theme") ?? "dark";
```

`Header.restoreTheme()` already reads from `localStorage` and sets the theme. The switcher reads it again independently. Consider a small `ThemeService` / shared constant to avoid duplicate `localStorage.getItem("app-theme")` calls and the hardcoded `"dark"` default.

---

### 9. `Button.variant` defaults to `"primary"` — `button.ts:9`

```typescript
variant = "primary",
```

But `IClickableConfig.variant` is typed as `ButtonVariant | undefined`. This means the default only exists at runtime in `Button`, while `Link` doesn't set a default. If `variant` is omitted on a `Link`, the class becomes `"btn btn- "` (with a trailing dash). Consider making the default explicit in the type or handling the undefined case in both components.

---

### 10. Commented-out CSS rule — `theme-switcher.scss:32`

```scss
// color: var(--text-inverse);
```

Remove or implement. Don't leave commented-out rules in production code.

---

## Low Priority / Suggestions

### 11. Button SCSS uses mixins not defined in this branch

```scss
.btn {
  @include btn-base;
  &-primary { @include btn-primary; }
  // ...
}
```

These mixins (`btn-base`, `btn-primary`, `btn-secondary`, `btn-ghost`, `btn-danger`, `card`, `hover-lift`, `heading`, `flex-column`, `flex-center`, `flex-between`, `tablet-down`) are presumably defined in the design-tokens branch. Just ensure they're merged first or this branch won't compile standalone.

---

### 12. `hero__code` elements use `padding: 5px` — `landing-page.scss`

```scss
padding: var(--space-2) var(--space-3);
// ...
padding: 5px; // ← also in features__grid and header__container
```

There are a few raw `5px` values mixed in with the design token system. Use a token (`var(--space-1)` or similar) for consistency.

---

### 13. Import order inconsistency — `landing-page.ts`

```typescript
import BaseComponent from "@/components/base/base-component";
import Link from "@/components/link/link";
import "./landing-page.scss";          // ← side-effect import in the middle
import { Header } from "@/components/layout/header/header";
import { EN } from "@/locale/en";
import { ICONS } from "@/assets/icons";
```

Convention: group side-effect imports (`*.scss`) at the top or bottom, separate from value imports.

---

### 14. No `aria-label` on theme-switcher buttons

The emoji-only buttons (`☀️` / `🌙`) have no accessible label. Screen readers will announce the emoji text, which isn't ideal. Add `aria-label="Switch to light theme"` / `aria-label="Switch to dark theme"`.

---

### 15. Documentation quality — `docs/base_component.md`

The `base_component.md` file is well-written and thorough (228 lines). Nice addition for onboarding. Consider adding a section on the component lifecycle (`destroy()` flow and when to call it).

---

### 16. `innerHTML` usage for SVG icons — `landing-page.ts:161`

```typescript
iconSvg.getNode().innerHTML = ICONS[icon as keyof typeof ICONS] || "";
```

The `ICONS` object contains hardcoded, trusted SVG strings — so this is safe as-is. Just worth adding a brief comment (e.g. `// Safe: ICONS contains only static SVG strings`) to make that intent clear for future contributors.

---

## File-by-File Summary

| File | Verdict | Key Notes |
|------|---------|-----------|
| `base-component.ts` | ✅ Good | Clean API, proper cleanup. Resolve `node` vs `getNode()` duality |
| `types.ts` | ✅ Good | Well-structured interfaces |
| `button.ts` | ✅ Good | Check default `variant` interaction with `Link` |
| `button.scss` | ✅ Good | Depends on external mixins |
| `link.ts` | ✅ Good | Handle missing `variant` gracefully |
| `header.ts` | ⚠️ Minor | Hardcoded strings, magic scroll number |
| `header.scss` | ✅ Good | Clean BEM, responsive |
| `theme-switcher.ts` | ⚠️ Minor | Duplicate localStorage logic, no a11y |
| `theme-switcher.scss` | ✅ Good | Remove commented-out CSS |
| `icons.ts` | ✅ Good | Clean inline SVGs |
| `en.ts` | ✅ Good | Well-organized locale structure |
| `landing-page.ts` | ⚠️ Minor | Unused field, hardcoded strings |
| `landing-page.scss` | ✅ Good | Minor raw pixel values |
| `app.ts` | ⚠️ Minor | Remove commented-out code |
| `base_component.md` | ✅ Good | Helpful docs |

---

## Verdict

**Approve with requested changes.** The architecture is clean and well-thought-out. Address Critical issues #1–2 and the medium-priority items before merging. Low-priority items can be tackled in a follow-up.
