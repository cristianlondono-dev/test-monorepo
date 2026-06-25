## 1. Fix the base font

- [x] 1.1 In `apps/web/src/app/globals.css`, change the `body` rule's `font-family` from `Arial, Helvetica, sans-serif` to `var(--font-sans), Arial, Helvetica, sans-serif`

## 2. Add a dedicated select style with cross-browser reset

- [x] 2.1 In `apps/web/src/components/UserForm.tsx`, add a `selectClass` constant that extends `inputClass` with `appearance-none`, right padding for the arrow (e.g. `pr-9`), and `bg-no-repeat`/`bg-[length:...]`/`bg-[position:...]` for a background-image arrow
- [x] 2.2 Add a light-mode dropdown arrow via an inline SVG `data:image/svg+xml` background-image (chevron-down, stroke color matching the light-mode text/border palette)
- [x] 2.3 Add a dark-mode variant of the arrow (`dark:bg-[url('...')]`) with a stroke color matching the dark-mode palette
- [x] 2.4 Apply `selectClass` to the `Rol` `<select>` in `UserForm.tsx` (replacing its current use of `inputClass`)

## 3. Verify in real browsers

- [x] 3.1 Run the app locally (or against the deployed `apps/web`) and open the "Nuevo usuario" form in Safari; confirm the `Rol` select's border/padding/background/font now match the text inputs and a custom arrow is visible
- [x] 3.2 Repeat the same check in Chrome and Firefox; confirm no visual regression from the current (already-acceptable) rendering
- [x] 3.3 Toggle OS dark mode and re-check the select arrow color in both light and dark mode, in at least Safari and one other browser
- [x] 3.4 Confirm body text now renders in the Geist font (not the Arial/Helvetica fallback) in all three browsers
