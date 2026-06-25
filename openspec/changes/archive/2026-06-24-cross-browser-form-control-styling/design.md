## Context

`apps/web` uses Tailwind CSS v4 (CSS-based config, no `tailwind.config.js`) and a single shared Tailwind class string (`inputClass`, duplicated in `UserForm.tsx` and `TaskForm.tsx`) for every `<input>`, `<textarea>`, and the one `<select>` (the `Rol` field in `UserForm.tsx`). `inputClass` only sets border, padding, background, text color, and focus border — it never touches `appearance`. Modern WebKit (Safari) renders unstyled `<select>` chrome (system font, native arrow, different intrinsic height) more aggressively than Chromium/Gecko, so the same class string produces visibly different results in Safari vs. Chrome/Firefox.

Separately, `globals.css`'s `body` rule hardcodes `font-family: Arial, Helvetica, sans-serif`, even though `layout.tsx` already loads and registers the Geist font (`--font-geist-sans`) as `--font-sans` via `@theme inline`. The hardcoded value wins (it's a literal property on `body`, not the `font-sans` utility), so the app renders in the system Arial/Helvetica fallback everywhere, and that fallback resolves to genuinely different fonts per OS/browser (real Helvetica on macOS/Safari, Arial substitutes elsewhere) — a second, independent source of "looks different in Safari."

## Goals / Non-Goals

**Goals:**
- Make the `Rol` `<select>` render with the same border/padding/background/text styling as the surrounding text inputs in Safari, Chrome, and Firefox, in both light and dark mode.
- Give the select a visible custom dropdown indicator once the native arrow is removed.
- Make the app actually render in the already-configured Geist font instead of the Arial/Helvetica fallback, consistently across browsers.

**Non-Goals:**
- Building a generic/reusable `<Select>` component or design system — there is exactly one `<select>` in the app today; over-abstracting for a single usage isn't warranted.
- Auditing every other form control (buttons, checkboxes, radios) for cross-browser parity — none exist in this codebase yet beyond the inputs/select already covered by `inputClass`.
- Changing the visual design (colors, spacing, border radius) — only fixing engine-default leakage, not redesigning.

## Decisions

### 1. Reset `<select>` appearance with the unprefixed `appearance-none` utility
**Decision:** add `appearance-none` to a new `selectClass` (see Decision 2) instead of relying on Tailwind's `inputClass` as-is.

**Why:** `appearance: none` is unprefixed and supported in current Safari, Chrome, and Firefox (no `-webkit-appearance`/`-moz-appearance` duplication needed anymore), and it's exactly what removes WebKit's native dropdown chrome so the existing border/padding/background classes in `inputClass` take over consistently.

**Alternative considered:** a CSS reset in `globals.css` targeting `select` globally (`@layer base { select { appearance: none } }`). Rejected for now since there's a single `<select>` call site — a Tailwind utility on that element is simpler to read and keeps the reset visible at the point of use rather than in a separate global file.

### 2. Add a `selectClass` (extends `inputClass`) with a custom arrow, instead of editing `inputClass` directly
**Decision:** introduce `selectClass = `${inputClass} appearance-none bg-no-repeat bg-[length:16px] bg-[right_0.75rem_center] pr-9 ...`` (exact Tailwind arbitrary-value classes finalized during implementation) with a background-image SVG chevron, applied only to the `<select>`. `inputClass` itself is untouched.

**Why:** `appearance-none` and right-padding-for-the-arrow only make sense for a dropdown; applying them to text `<input>`/`<textarea>` elements would be a no-op at best and could clip text unnecessarily on the right. Scoping the reset to a dedicated class avoids touching the (working) input/textarea styling at all — smallest possible blast radius.

**Why an inline SVG `background-image` instead of a third-party icon set:** no icon library is currently a dependency; a `currentColor`-less inline `data:image/svg+xml` chevron (one for light mode, one for dark mode via the `dark:` variant, since `background-image` can't use `currentColor` the way an inline SVG element can) keeps this change dependency-free.

**Alternative considered:** wrapping the `<select>` in a positioned `<div>` with an absolutely-positioned arrow icon (e.g. from `lucide-react` or similar) on top. Rejected as more markup and a new dependency for a problem `background-image` + `appearance-none` already solves in CSS alone.

### 3. Fix the body font by composing with the existing `--font-sans` variable, not by removing the fallback
**Decision:** change `globals.css`'s `body` rule to `font-family: var(--font-sans), Arial, Helvetica, sans-serif;` instead of removing the Arial/Helvetica fallback chain entirely.

**Why:** `--font-sans` already resolves to the loaded Geist variable via `@theme inline`, so this makes Geist the actual rendered font (consistent across Safari/Chrome/Firefox, since it's a webfont, not a system font substitution) while keeping Arial/Helvetica/sans-serif as a safe fallback chain if font loading ever fails — same intent as the original line, just no longer shadowing the webfont that's already being paid for (downloaded) on every page load.

**Alternative considered:** removing the `body { font-family }` rule entirely and adding `font-sans` to the `<body>` className in `layout.tsx`. Rejected — functionally equivalent, but touches a different file for no added benefit; the one-line CSS fix is smaller and keeps the existing structure (custom property already defined for exactly this purpose).

## Risks / Trade-offs

- **[Risk]** An inline SVG `data:` URI background-image arrow needs a separate dark-mode variant (can't use `currentColor` in a CSS `background-image` data URI the way you can on an inline `<svg>` element with `fill="currentColor"`) → **Mitigation:** define two arrow SVGs (light/dark stroke color) and switch via Tailwind's `dark:bg-[url('...')]` variant, matching the existing `dark:` pattern already used throughout `inputClass`.
- **[Risk]** Visual-only changes are easy to "fix" without actually checking the browser that motivated the report → **Mitigation:** manual verification step in tasks.md explicitly calls for checking in Safari (the reported browser) before/after, not just trusting the CSS reasoning.
- **[Risk]** Changing `body`'s rendered font (Arial/Helvetica → Geist) is a visible change beyond just the select, and could be perceived as in scope or out of scope depending on taste → **Mitigation:** called out explicitly in the proposal as one of the two root causes found during investigation, not snuck in silently; easy to revert independently of the select fix if undesired.

## Open Questions

- Should the custom select arrow's exact size/spacing match any existing design spec, or is "looks like a normal select arrow, roughly 16px, matching the app's zinc palette" sufficient? Defaulting to the latter since no design system/Figma reference exists in this repo.
