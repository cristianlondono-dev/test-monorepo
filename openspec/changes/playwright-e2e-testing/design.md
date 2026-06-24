## Context

`apps/web` has zero testing infrastructure (`apps/web/.claude/agents/frontend-specialist.md` is explicit: nothing gets added without the user asking — the user has now asked, specifically for Playwright and specifically wanting to use its MCP server). The previous change (`task-management-frontend`) was verified by direct API calls + reading rendered HTML because no browser-automation tool was available in-session, and an ad hoc `npm install playwright` + `npx playwright install` was blocked by the auto-mode permission classifier as an undeclared, unapproved action. This change makes that capability a deliberate, approved part of the project instead of an ad hoc workaround.

Separately, this same investigation surfaced that `pnpm dev` (apps on host, Postgres in Docker) can't resolve the `db`/`api` Docker-network hostnames from the host machine — the project's `docker compose up -d --build` flow is the one that's actually been proven to work end-to-end. That gap is real but orthogonal to adding e2e testing, so it's called out as a Non-Goal here rather than silently bundled into this change.

## Goals / Non-Goals

**Goals:**
- Register the Playwright MCP server (`@playwright/mcp`) for this project so any future session can drive a real browser via MCP tools, with the user's explicit one-time approval.
- Add `@playwright/test` to `apps/web` with a working config, an explicit one-time browser-binary install step, and an npm script to run it.
- Write a committed regression suite (`apps/web/e2e/*.spec.ts`) covering the `user-management-ui`/`task-management-ui` requirements from `task-management-frontend`: create/edit/delete for both users and tasks, the assignee checklist, and the status checkbox.
- Use the MCP browser interactively to explore `/users` and `/tasks` beyond the scripted flows and catalogue whatever breaks.
- Write `openspec/changes/playwright-e2e-testing/findings.md`: every issue found (from the exploration and from writing the suite), detailed enough to seed a follow-up `/opsx:propose` that fixes them.

**Non-Goals:**
- Not fixing any bug found by this change — findings are documented, not patched, here.
- Not wiring e2e tests into CI — there is no CI pipeline in this repo yet.
- Not adding component/unit testing (Vitest/RTL) — the user asked specifically for client-side e2e with Playwright.
- Not adding new backend tests — scope is the client ("del lado del cliente"), `apps/api` is exercised only as a real dependency, not a test target.
- Not fixing the `pnpm dev` host/Docker-hostname resolution gap — tests target the already-working `docker compose up -d --build` stack instead.

## Decisions

**Register the Playwright MCP server via a project-scoped `.mcp.json`, not a global/user-level config.**
`{ "mcpServers": { "playwright": { "command": "npx", "args": ["@playwright/mcp@latest"] } } }` at the repo root. Project-scoped means it's versioned and visible in review, and Claude Code will prompt for one-time trust approval the first time it's used — exactly the explicit-approval path that was missing before.

**E2E tests target the already-proven `docker compose up -d --build` stack via configurable URLs, not `pnpm dev`.**
`playwright.config.ts` reads `E2E_BASE_URL` (default `http://localhost:3000`) for the app and tests read `E2E_API_URL` (default `http://localhost:4000`) for direct API seeding calls. This sidesteps the known `pnpm dev` hostname gap entirely instead of trying to fix unrelated infra as part of a testing change.

**Tests seed and clean up their own data via direct API calls (Playwright's `request` fixture), not mocks.**
Consistent with how `task-management-frontend` itself was verified (real API, real Postgres, no mocking layer exists anywhere in this stack). Each spec creates the users/tasks it needs in `beforeEach`/within the test and deletes them in `afterEach`/at the end, so the suite is repeatable against the shared dev database without accumulating data.

**E2E specs live in `apps/web/e2e/`, outside `src/`, using no special tsconfig/eslint scoping.**
`apps/web/tsconfig.json`'s `include` is actually `**/*.ts`/`**/*.tsx` (not scoped to `src/`), so it already covers `e2e/` — no separate tsconfig needed. ESLint (`eslint .`) similarly already covers the whole app directory. Since specs import `test`/`expect` explicitly from `@playwright/test` rather than relying on ambient globals, no special ESLint globals/override config is needed either — confirmed by running `pnpm --filter web lint`/`type-check` after writing the files, not assumed upfront.

**Confirmed bugs get `test.fixme()` in the suite, with a comment pointing at the matching `findings.md` entry.**
Keeps `pnpm --filter web test:e2e` green and meaningful (a failing run should mean "something broke that used to work," not "known issue #4 is still open"). The actual bug detail and repro steps live in `findings.md`, not scattered across skip comments.

**Browser binary installation (`playwright install chromium`) is an explicit, visible task — not a `postinstall` hook.**
Downloading browser binaries is the exact action that was blocked when attempted ad hoc; making it a deliberate, visible step in `tasks.md` means the user (or their permission settings) approves it knowingly instead of it firing silently on every `pnpm install`.

## Risks / Trade-offs

- [Risk] E2E tests mutate real rows in the shared dev Postgres database (no isolated test database/tenant exists). → Mitigation: every spec creates and tears down only its own data; acceptable since this is a single-developer dev database at this stage.
- [Risk] Trusting the Playwright MCP server requires a one-time manual approval step in Claude Code. → Mitigation: expected and desired — this is exactly the explicit-consent path that ad hoc installs lacked.
- [Risk] Running the suite requires the full Docker stack up and reachable at the configured URLs; running it with nothing up will fail confusingly. → Mitigation: document the `docker compose up -d --build` prerequisite directly in the npm script's failure path / README note.
- [Risk] Browser binaries are a sizeable one-time download. → Mitigation: explicit task, run once, cached by Playwright afterward.

## Migration Plan

1. Add `.mcp.json` registering the Playwright MCP server; get the user's one-time trust approval.
2. Add `@playwright/test` to `apps/web`, `playwright.config.ts`, the `test:e2e` script, and install the Chromium binary.
3. Write `apps/web/e2e/users.spec.ts` and `apps/web/e2e/tasks.spec.ts` covering the flows from `task-management-frontend`'s specs.
4. Run the committed suite against the Docker stack and confirm it's green (or mark genuinely broken flows `test.fixme()`).
5. Use the Playwright MCP browser tools interactively to explore `/users` and `/tasks` for edge cases the scripted suite doesn't cover.
6. Write `findings.md` consolidating every issue found in steps 3–5.
7. Run `pnpm --filter web lint` and `pnpm --filter web type-check` to confirm the new files don't break existing checks.

No production rollout involved; this is local dev/testing tooling only.

## Open Questions

None outstanding — scope (exploratory testing + a permanent regression suite, both via Playwright) was confirmed with the user before writing this design.
