## Why

`apps/web` has no testing framework and the `task-management-frontend` change was verified by hand (API calls + reading rendered HTML) because no browser-automation tool was available — drawer interactions, form pre-fill, and the no-assignee guard were never actually clicked through. We need a real way to drive the app in a browser, both interactively (to find bugs now) and repeatably (to catch regressions later), and to come out of this with a concrete list of issues to fix next.

## What Changes

- Configure the Playwright MCP server (`@playwright/mcp`) for this project so Claude can drive a real browser interactively in any future session, instead of attempting ad-hoc installs.
- Add `@playwright/test` as a devDependency of `apps/web` with its config (`playwright.config.ts`), pointed at the local stack (`apps/api` + `apps/web` + Postgres), and `pnpm --filter web test:e2e`-style scripts.
- Add a committed regression suite (`apps/web/e2e/*.spec.ts`) covering the `users` and `tasks` flows from `task-management-frontend`: create/edit/delete for both, the assignee checklist, and the status checkbox.
- Run an exploratory testing pass over `/users` and `/tasks` using the Playwright MCP browser tools (not the committed suite) to click through edge cases a fixed spec list might miss.
- Produce a detailed findings document (`openspec/changes/playwright-e2e-testing/findings.md`) cataloguing every bug/issue found by either the exploratory session or while writing the regression suite, written so it can seed a follow-up `/opsx:propose` to fix them.

## Capabilities

### New Capabilities
- `e2e-test-infrastructure`: Playwright MCP configured for the project, plus `@playwright/test` wired into `apps/web` (config, scripts, a way to seed/reset test data against the real API) so e2e tests are runnable locally and the MCP browser is usable interactively.
- `e2e-regression-suite`: a committed set of Playwright specs exercising the user-management and task-management UI flows end-to-end against the real stack.

### Modified Capabilities
- None — purely additive testing infrastructure; no existing requirements change.

## Impact

- **apps/web**: new `playwright.config.ts`, `e2e/` test directory, new `@playwright/test` devDependency, new `package.json` scripts (`test:e2e` or similar).
- **Project-level MCP config**: a new `.mcp.json` entry (or equivalent) registering the Playwright MCP server, requiring user approval the first time it's trusted.
- **apps/api**: no code changes; tests will run against the real API (likely the already-running Docker stack), and may need test data created/cleaned up via direct API calls in test setup/teardown.
- **New artifact**: `openspec/changes/playwright-e2e-testing/findings.md`, the bug/issue report intended to be the input for a subsequent proposal.
- **Dependencies**: adds `@playwright/test` (and the Playwright browser binaries it downloads) to `apps/web`'s devDependencies; the MCP server itself runs via `npx @playwright/mcp@latest`, not an installed dependency.
