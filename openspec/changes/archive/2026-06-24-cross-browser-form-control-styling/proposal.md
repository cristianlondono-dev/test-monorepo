## Why

`apps/web`'s form controls (the `Rol` `<select>` in `UserForm.tsx`, and by extension any future `<select>`) render visibly differently in Safari than in Chrome/Firefox: Safari keeps its native dropdown chrome (system font, native arrow, different height/padding) because the shared `inputClass` Tailwind string applied to inputs, textareas, and selects never resets `appearance`, so Chromium/Gecko's more permissive default styling lets the custom border/padding/colors "just work" while WebKit does not. The investigation also found the page body's `font-family` is hardcoded to `Arial, Helvetica, sans-serif` in `globals.css`, overriding the already-configured Geist font variables — Safari (macOS) actually has `Helvetica`, while other platforms fall further down the stack, compounding the visual mismatch the user is seeing. We need a consistent, intentional appearance for form controls and the base font across browsers instead of relying on each engine's UA defaults.

## What Changes

- Add a cross-browser reset for native form controls (starting with `<select>`, applied via the shared `inputClass` used by `UserForm.tsx` and `TaskForm.tsx`) so Safari/WebKit, Chrome, and Firefox render the same border, padding, background, and text styling.
- Add a custom dropdown indicator (SVG background-image arrow) for `<select>` elements once the native WebKit arrow is removed via `appearance-none`, so selects still visually communicate they're dropdowns.
- Fix `apps/web/src/app/globals.css`'s `body` rule to actually use the already-loaded Geist font variable instead of the hardcoded `Arial, Helvetica, sans-serif` fallback, removing a second source of cross-browser visual inconsistency.
- No changes to form behavior, validation, or the DTOs/types — this is styling-only.

## Capabilities

### New Capabilities
- `cross-browser-form-styling`: consistent rendering of native form controls (select, and the shared input/textarea styling they share a class with) and the base body font across Safari, Chrome, and Firefox.

### Modified Capabilities
(none — no existing specs in this repo cover UI styling yet)

## Impact

- **Affected code:** `apps/web/src/components/UserForm.tsx`, `apps/web/src/components/TaskForm.tsx` (shared `inputClass`), `apps/web/src/app/globals.css`.
- **Affected systems:** none beyond the `apps/web` frontend — no API, database, or deployment changes.
- **Dependencies:** none added; uses plain CSS (Tailwind v4 utility/arbitrary values), no new package.
- **Risk:** low — purely visual; should be checked in at least Safari and Chrome (and ideally Firefox) before/after to confirm parity, including light and dark mode (the app supports `prefers-color-scheme: dark`).
