## Context

`apps/web` is a bare Next.js 16 App Router scaffold (React 19, Tailwind CSS 4, no UI/icon/form library, no client-side state library like SWR/React Query, no testing framework). The only existing code is `src/app/page.tsx` (placeholder), `src/app/layout.tsx`, and `src/lib/api.ts` with a single `getApiHealth()` helper that does a server-side `fetch` to `${NEXT_PUBLIC_API_URL}/health`. `apps/api` already exposes full CRUD for `users` and `tasks` (`task-management-backend`), has CORS enabled (`app.enableCors()` in `main.ts`), and its DTOs/entities are mirrored in `@repo/types` (`User`, `UserRole`, `Task`, `TaskStatus`, and the Create/Update DTO shapes).

The project deliberately keeps `apps/web` dependency-free beyond the scaffold (`apps/web/.claude/agents/frontend-specialist.md`: no testing framework added without asking, no extra UI library currently in use). `NEXT_PUBLIC_API_URL` being a public env var signals the API is meant to be called directly from the browser, not proxied through Next.js server code.

## Goals / Non-Goals

**Goals:**
- A `/users` page: table of all users, create/edit through a slide-in drawer, delete with a trash-icon button.
- A `/tasks` page: list of all tasks (name, description, due date, assignees), create/edit through a drawer (assign one or more users, set due date and description), delete with a trash-icon button, and a checkbox per task to toggle `status` between `pending`/`completed`.
- Reuse `@repo/types` for every shape exchanged with the API; no type duplication.
- Ship with zero new runtime dependencies — build the drawer, forms, and icons with what's already installed (React 19 + Tailwind 4).

**Non-Goals:**
- No automated tests. `apps/web` has no test framework installed, and project convention requires confirming with the user before adding one (Vitest/RTL or Playwright) — out of scope unless asked.
- No optimistic UI, caching layer, or global state management (no SWR/React Query/Zustand). Each list re-fetches from the API after a mutation.
- No pagination/filtering/sorting on the tables — mirrors the backend, which returns full arrays.
- No auth/permissions UI — `role` is displayed but nothing is gated by it yet (matches backend scope).

## Decisions

**Initial list data is fetched server-side; mutations call the API directly from the browser.**
`apps/web` pulls in `eslint-plugin-react-hooks@7.1.1`, whose `set-state-in-effect` rule flags *any* `setState` reachable from a `useEffect` body — including the common "fetch on mount" pattern — and the project convention is to fix this in the centralized `packages/eslint-config`, not with local overrides. So `/users` and `/tasks` are plain `async` Server Components (`page.tsx`) that call `getUsers()`/`getTasks()` directly and pass the data down as props to a `"use client"` view component (`UsersView`/`TasksView`) — no client-side fetch-on-mount, no loading-flicker state needed for the first render. Mutations (create/update/delete/toggle) still happen as direct browser → `apps/api` calls from those client components (consistent with `NEXT_PUBLIC_API_URL` being public and CORS already being enabled), followed by `router.refresh()` so the Server Component re-fetches and passes fresh props down — this preserves the original rationale (browser talks to the NestJS API directly) for everything except the initial read.

**Extend `src/lib/api.ts` with one function per endpoint, typed with `@repo/types`, plus a shared error-message helper.**
`getUsers`, `createUser`, `updateUser`, `deleteUser`, `getTasks`, `createTask`, `updateTask`, `deleteTask`. A `parseApiError(res)` helper reads the NestJS error JSON body (`{ message, statusCode }`, where `message` can be a string or `string[]` from `class-validator`) and returns a single display string, so forms can show backend validation errors (duplicate email, unknown assignee, etc.) inline instead of a generic failure message.

**Three explicit layers, each with one responsibility: API client → business-logic hooks → presentational components.**
`src/lib/api.ts` only knows how to talk HTTP to `apps/api` (no React, no UI concerns). `src/hooks/useUserActions.ts` and `src/hooks/useTaskActions.ts` are the business-logic layer: they decide create-vs-update from whether an id is present, call the right `lib/api.ts` function, and own the post-mutation `router.refresh()`. `UserForm`/`TaskForm` are purely presentational — they hold local field state and call an `onSubmit(dto)` prop, with no knowledge of `lib/api.ts` or whether they're creating or editing. `UsersView`/`TasksView` own only UI state (which drawer is open, which row is being edited) and wire the hook's functions to the form's `onSubmit`/the row's delete button/the checkbox's `onChange`. This keeps each file single-purpose and means the mutation logic (hooks) is testable independent of any rendering.

**Build a single reusable `Drawer` component from scratch (no headless-UI/Radix dependency).**
A controlled `{ open, onClose, title, children }` panel: fixed-position backdrop + slide-in panel using Tailwind `translate-x` transitions, closes on backdrop click or `Escape`. Both the user form and the task form render inside it. This is the only genuinely reusable UI primitive needed; everything else (table rows, buttons) is plain markup, so one component covers the "drawer" requirement without pulling in a library for one piece of chrome.

**Delete buttons use an inline SVG trash icon component, not an icon library.**
A small `TrashIcon` component (one `<svg>`, currentColor stroke) shared by both pages. Adding `lucide-react` or similar for a single icon isn't justified given the project's stated preference not to add dependencies that weren't asked for.

**Assignee selection on the task form is a checklist of users, not a native multi-select.**
A native `<select multiple>` is a known UX pitfall (hidden affordance, awkward on touch). Since `apps/web` has no multi-select component, the task form renders the user list as checkboxes (`assigneeIds` state = array of checked ids), which is both simpler to build and more discoverable — matches the "muy intuitiva" requirement.

**Forms are plain controlled components with native HTML5 validation, no form library.**
`useState` per field, `required`/`type="email"`/`type="date"` attributes for baseline validation, and the `parseApiError` message surfaced inline on submit failure. Consistent with not adding `react-hook-form`/`zod` for two small forms.

**Toggling a task's status is a single `PATCH /tasks/:id` call from the checkbox's `onChange`, no separate confirmation step.**
Matches the backend design (no dedicated toggle endpoint) and the original "checkbox" requirement — checking/unchecking immediately reflects the new state (optimistic local update, reconciled by the response).

**Root layout gets a minimal nav (`Usuarios` / `Tareas`); `/` redirects to `/tasks`.**
Two pages need a way to navigate between them; a two-link nav in `layout.tsx` is the smallest addition that satisfies that. Redirecting `/` to `/tasks` (`redirect()` from `next/navigation`) gives visitors something useful immediately instead of the placeholder scaffold content, which this change replaces.

## Risks / Trade-offs

- [Risk] No shared/global state between `/users` and `/tasks`: deleting or renaming a user on `/users` won't update an already-rendered `/tasks` list until it's revisited/refetched. → Mitigation: acceptable for this minimal scope (no state library); each page is the source of truth for its own data on mount.
- [Risk] Every mutation triggers a full list re-fetch instead of an optimistic/local patch, so the UI has a brief loading flicker on each action. → Mitigation: acceptable trade-off for simplicity; can be revisited if it feels sluggish in practice.
- [Risk] Calling the API directly from the browser exposes `apps/api`'s full surface to anyone with network access to it (no auth yet). → Mitigation: matches the backend's own current scope (no auth/authorization implemented there either); not introduced or worsened by this change.
- [Risk] Plain HTML5 validation won't catch every invalid case before hitting the API (e.g. duplicate email is only knowable server-side). → Mitigation: `parseApiError` surfaces the backend's rejection message inline, so the user still gets clear feedback, just one round-trip later.

## Migration Plan

1. Extend `apps/web/src/lib/api.ts` with the users/tasks CRUD functions and the `parseApiError` helper.
2. Build the shared `Drawer` and `TrashIcon` components.
3. Build the user form and `/users` page (table, create/edit drawer, delete).
4. Build the task form (with the assignee checklist) and `/tasks` page (list, create/edit drawer, delete, status checkbox).
5. Add the nav to `layout.tsx` and redirect `/` to `/tasks`.
6. Run the local stack (`pnpm dev` with Postgres + `apps/api` up) and manually verify both flows end-to-end in the browser.
7. Run `pnpm --filter web lint` and `pnpm --filter web type-check`.

No production rollout involved (no deployed environment yet); rollback is reverting the commits — this change touches only `apps/web`.

## Open Questions

None outstanding — task CRUD scope was confirmed with the user (full CRUD for tasks, matching users) before writing this design.
