## Why

Right now there is no CI in this repository: merges into `develop` and `main` happen without running the Playwright end-to-end suite that already exists for `apps/web` (`apps/web/e2e/*.spec.ts`). A regression introduced in a feature branch can reach `develop`, and a regression introduced in `develop` can reach `main`, without anyone noticing until it's exercised manually. We need an automated gate that runs the existing client-side tests on every pull request into these two branches and blocks the merge when at least one test fails.

## What Changes

- Add a GitHub Actions workflow that runs the existing Playwright e2e suite (`pnpm --filter web test:e2e`) against `apps/web`, triggered on pull requests targeting `develop` and pull requests targeting `main`.
- The workflow brings up the dependencies the suite needs to run for real (Postgres, `apps/api`, `apps/web`) using the existing `docker-compose.yml`, the same way the suite is run locally, before invoking Playwright.
- The workflow reports a single required check; if any spec in the suite fails, the check fails.
- Document (and where possible configure) branch protection rules on `develop` and `main` so GitHub refuses to merge a pull request whose required check hasn't passed. **Note:** enabling required status checks is a GitHub repository setting, not something the workflow YAML can enforce by itself — this change includes the concrete steps/commands needed but applying them against the live repository needs explicit confirmation since it changes merge permissions for everyone.
- No changes to the existing test specs themselves (`apps/web/e2e/users.spec.ts`, `apps/web/e2e/tasks.spec.ts`) — this change only wires the already-working suite into CI.

## Capabilities

### New Capabilities
- `client-e2e-ci-gate`: a GitHub Actions workflow (and the branch protection configuration it depends on) that runs the client-side Playwright e2e suite on pull requests into `develop` and `main`, blocking the merge if any test fails.

### Modified Capabilities
(none — `apps/web`'s e2e suite already exists and is not being changed, only invoked from CI)

## Impact

- **Affected code:** new file(s) under `.github/workflows/`; no application code changes.
- **Affected systems:** GitHub branch protection settings for `develop` and `main` (repository configuration, not code).
- **Dependencies:** reuses the existing `docker-compose.yml`, `.env.example`, and `apps/web/playwright.config.ts` / `apps/web/e2e/helpers.ts` already added in the `playwright-e2e-testing` change — no new test dependencies are introduced.
- **Runtime cost:** every PR into `develop` or `main` will spin up Postgres + `api` + `web` in CI and run the Chromium e2e suite, adding CI minutes to those two merge paths specifically (not to every push to a feature branch).
