# Findings: task-management-frontend UI testing

Source of each issue is noted. Severity: **High** (data integrity / silently wrong state), **Medium** (confusing UX, no data loss), **Low** (cosmetic).

---

## Issue #1 — Create-mode drawer forms don't reset between consecutive creates

**Severity:** High
**Found by:** Manual testing (you created a task in the dev database describing this exact symptom: *"los formularios no estan volviendo a su estado inicial (Sin datos) después de llenarlos"*), confirmed and isolated via Playwright.
**Affected:** `UserForm` (via `UsersView.tsx`) and `TaskForm` (via `TasksView.tsx`) — same root cause in both.
**Regression test:** `apps/web/e2e/users.spec.ts` and `apps/web/e2e/tasks.spec.ts`, both `test.fixme("... resets to empty fields on a second ... open")`.

**Root cause:** Both view components force the form to remount on a new entity via `key={editingUser?.id ?? "create"}` (`UsersView.tsx`) / `key={editingTask?.id ?? "create"}` (`TasksView.tsx`). This correctly remounts when switching between two *different* existing rows, or between edit and create. But every create session uses the literal same key, `"create"` — so opening "Nuevo usuario"/"Nueva tarea" a second time in the same page session does **not** remount `UserForm`/`TaskForm`, and their `useState` field values (initialized once, from props, at first mount) are never re-initialized to empty.

**Repro steps (users):**
1. Go to `/users`, click "Nuevo usuario".
2. Fill in any valid user and click "Guardar" (creates successfully, drawer closes).
3. Click "Nuevo usuario" again.
4. **Expected:** all fields empty. **Actual:** every field still shows the previous user's values.

**Repro steps (tasks) — more severe:**
1. Go to `/tasks`, click "Nueva tarea".
2. Fill in a task, check one assignee, click "Guardar".
3. Click "Nueva tarea" again.
4. **Expected:** empty fields, no assignee checked. **Actual:** name/description carry over, **and the previous assignee is still checked** — submitting without noticing would silently create a new task assigned to the wrong person.

**Suggested fix direction (for the follow-up proposal, not applied here):** give the "create" key session-uniqueness, e.g. `key={editingUser?.id ?? \`create-${drawerOpenCount}\`}`, or reset local form state in an effect keyed off the drawer's `open` transition, or lift field state out of the form and reset it explicitly in `openCreate()`.

---

## Issue #2 — Due dates display one day earlier than stored (timezone bug)

**Severity:** High
**Found by:** Exploratory MCP session (task 4.2), creating/editing tasks with explicit due dates.
**Affected:** `TasksView.tsx` line 11, `formatDate()`.

**Root cause:**
```ts
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}
```
`dueDate` is stored as midnight UTC (e.g. `"2099-12-31T00:00:00.000Z"`, confirmed via `GET /tasks`). `toLocaleDateString()` with no arguments formats in the *browser's local timezone*. In any timezone behind UTC (the dev browser resolved `Intl.DateTimeFormat().resolvedOptions().timeZone` to `America/Bogota`, UTC-5), midnight UTC is still the previous day locally, so the displayed date is always one day earlier than what's stored.

**Repro steps:**
1. Go to `/tasks`, click "Nueva tarea".
2. Fill in a name, description, assign someone, and set "Fecha de cierre" to `2099-12-31`.
3. Save.
4. **Expected:** card shows "Vence: 31/12/2099". **Actual:** card shows "Vence: 30/12/2099".
5. Confirmed via `curl http://localhost:4000/tasks`: the stored `dueDate` is `2099-12-31T00:00:00.000Z` — the data is correct, only the display is wrong.
6. Same off-by-one reproduces when editing an existing task's due date (tested mid-list edit, `2010-05-15` → displayed as "14/5/2010").
7. Affects every existing task, not just new ones (the seeded "Testear el front" task has `dueDate: "2026-06-24T00:00:00.000Z"` but displays "Vence: 23/6/2026").

**Suggested fix direction (not applied here):** format with an explicit UTC-anchored call, e.g. `new Date(iso).toLocaleDateString(undefined, { timeZone: "UTC" })`, since the date is a calendar date with no meaningful time-of-day component.

---

## Issue #3 — React hydration error #418 on every fresh load of `/tasks`

**Severity:** Medium
**Found by:** Exploratory MCP session (task 4.1/4.2), navigating to `/tasks` directly.
**Affected:** Same root cause as Issue #2 — `formatDate()` in `TasksView.tsx:11`.

**Root cause:** `apps/web/src/app/tasks/page.tsx` is a server component that fetches tasks and renders `TasksView` (a client component) with the due-date text server-side. `toLocaleDateString()` with no explicit locale/timeZone produces a different string in the SSR environment (Docker container, locale/timezone of the Node process) than in the browser during hydration (`America/Bogota` in this session), so the server-rendered text node doesn't match the client's first render. React throws "Minified React error #418" (text content mismatch during hydration) and discards/regenerates that part of the tree.

**Repro steps:**
1. Navigate (full page load, not client-side route change) to `/tasks`.
2. Open the browser console.
3. **Expected:** no errors. **Actual:** `Error: Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]=` logged on every fresh load, consistently reproduced across 3 separate navigations in this session.

**Note:** this doesn't visibly break the page (React recovers by patching the mismatched node), but it indicates the SSR output is wrong and is a symptom of the same `toLocaleDateString()` problem as Issue #2. Fixing Issue #2 (anchoring the format to UTC) should also resolve this, since the formatted string would then be identical on server and client regardless of either one's local timezone.

---

## Issue #4 — "Guardar" button unreachable in the create/edit drawer on short viewports

**Severity:** Medium
**Found by:** Exploratory MCP session (task 4.1), while the browser window was at its initial size of 1200×524.
**Affected:** The user/task create-edit drawer (shared layout in `UsersView.tsx` / `TasksView.tsx`).

**Root cause:** the drawer panel (`absolute right-0 top-0 h-full w-full max-w-md ...`) has a fixed height equal to the viewport, but its content (header + scrollable body) can add up to more than that height. The scrollable body (`overflow-y-auto px-6 py-4`) sizes itself to its own content instead of being constrained to the remaining space inside its flex parent (missing something like `min-h-0`/`flex-1`), so once total content exceeds the viewport height, the overflow is simply clipped with **no working scrollbar anywhere in the ancestor chain** — `scrollIntoView()` on the "Guardar" button has no effect, and Playwright's own auto-wait reports the button as permanently "outside of the viewport".

**Repro steps:**
1. Resize the browser window to roughly 1200×524 (or any height where the form is taller than the visible drawer; the "Nuevo usuario" form needs ~600px for its 6 fields + submit button).
2. Open "Nuevo usuario" (or "Nueva tarea").
3. Try to scroll down to reach "Guardar".
4. **Expected:** the drawer scrolls and the button becomes reachable. **Actual:** nothing scrolls; the button stays clipped below the visible area indefinitely.
5. Confirmed by inspecting computed styles: the `overflow-y-auto` container's `clientHeight` equals its own `scrollHeight` (no overflow registered at that level), while its parent (`h-full`, `clientHeight: 524`) has `scrollHeight: 603` but `overflow-y: visible` (no scrollbar).
6. At 1280×800 the same form fits and "Guardar" is reachable normally — this only manifests when viewport height is shorter than the form's natural height (~600px for the longer forms).

**Suggested fix direction (not applied here):** make the drawer's content area `flex flex-col` with the scrollable body as `flex-1 min-h-0 overflow-y-auto`, so it's constrained to the remaining space and actually scrolls instead of growing past its container.

---

## Issue #5 — Long task descriptions aren't truncated in the list

**Severity:** Low
**Found by:** Exploratory MCP session (task 4.2), creating a task with a ~2200-character description.
**Affected:** Task list item rendering in `TasksView.tsx`.

**Repro steps:**
1. Create a task with a very long description (tested with ~2200 characters).
2. **Expected:** some truncation, line-clamp, or "show more" affordance. **Actual:** the full text renders unclamped, making that single list item span the entire viewport height and pushing every other task far down the page.

No console errors, no data issue — purely a visual/UX gap for an edge case the form doesn't prevent (the description `textarea` has no `maxLength`).

---

## Exploratory session — confirmed correct behavior (not bugs)

Checked during tasks 4.1/4.2, no console errors or unexpected state in any of these:
- `/users`: empty required fields blocked by native HTML5 validation ("Completa este campo"), including the easy-to-miss "Indicativo de país" field.
- `/users`: invalid email format blocked by native HTML5 validation before any request is sent.
- `/users`: duplicate email is rejected server-side (`409 Conflict`) and the drawer shows a clear inline message ("Email ... is already in use") without losing the entered field values.
- `/users`: switching the "Rol" select before submitting persists correctly (verified a user created with "Admin" actually saved with that role).
- `/users` and `/tasks`: rapid open/close of the create drawer (6 cycles in quick succession) does not duplicate rows, lose state inconsistently, or throw — confirms the root cause described in Issue #1 (shared `"create"` key) is about stale field values, not structural instability.
- `/tasks`: creating without any assignee is blocked by a clear client-side message ("Selecciona al menos un responsable").
- `/tasks`: rapidly toggling the status checkbox 5 times in a row eventually converges to the correct state in both the UI and the backend (`GET /tasks` confirmed `status: "completed"` after an odd number of toggles) — consistent with the lack of optimistic local state already noted in the suite notes below; there's a brief visible lag but no permanent inconsistency.
- `/tasks`: editing a task in the middle of a 3-item list opens the drawer with that exact task's data and saves changes back to the correct item.

---

## Suite notes (not bugs, test-authoring corrections made while building the suite)

- The tasks-page status checkbox's `checked` state is driven entirely by the `task` prop with no local/optimistic state, so it only updates after the `updateTask` call and the following `router.refresh()` round-trip. Playwright's `.check()`/`.uncheck()` perform their own immediate verification and failed against this (`"Clicking the checkbox did not change its state"`), even though the underlying behavior is correct — `apps/web/e2e/tasks.spec.ts` uses a plain `.click()` followed by a separate `expect(checkbox).toBeChecked()` (which auto-retries) instead. Not a product bug, but worth knowing if this pattern recurs in future specs.
