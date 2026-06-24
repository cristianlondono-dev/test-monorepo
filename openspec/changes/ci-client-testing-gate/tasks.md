## 1. Workflow skeleton

- [x] 1.1 Create `.github/workflows/client-e2e-tests.yml` with `on.pull_request.branches: [develop, main]` and a single job (e.g. `e2e`) running on `ubuntu-latest`
- [x] 1.2 Add steps to check out the repo, set up Node (matching `engines.node` in root `package.json`) and pnpm via `corepack`, and cache pnpm/Turborepo outputs
- [x] 1.3 Run `pnpm install --frozen-lockfile`

## 2. Bring up the stack

- [x] 2.1 Add a step that writes a CI-specific `.env` (based on `.env.example` but with `DATABASE_URL` pointed at `localhost`, not the Compose service name `db`, per design.md Decision 3) — no secrets needed, same placeholder values already in `.env.example`
- [x] 2.2 Run `docker compose up -d db` and wait for the `db` service's existing healthcheck to report healthy before continuing (poll, don't `sleep` a fixed duration)
- [x] 2.3 Export `NEXT_PUBLIC_API_URL=http://localhost:4000` and run `pnpm turbo run build --filter=api... --filter=web...` (must run before migrations — `apps/api`'s entities import types from `@repo/types`, which TypeORM/ts-node type-checks when loading entities for `migration:run`, so the workspace package needs to be built first)
- [x] 2.4 Run `pnpm --filter api migration:run` against that database
- [x] 2.5 Start `apps/api` and `apps/web` in the background (e.g. `pnpm --filter api start &`, `pnpm --filter web start &`), redirecting each process's output to a log file the job can show or upload on failure
- [x] 2.6 Add a readiness step that polls `http://localhost:4000` and `http://localhost:3000` until both respond (or a timeout is hit), failing the job with a clear "stack did not become ready" message if the timeout is reached

## 3. Run the e2e suite

- [x] 3.1 Run `pnpm --filter web exec playwright install --with-deps chromium`
- [x] 3.2 Run `pnpm --filter web test:e2e`
- [x] 3.3 On failure, upload the Playwright HTML report (and the `apps/api`/`apps/web` background-process logs from 2.5) as a workflow artifact via `actions/upload-artifact`, so a failing run is debuggable from the GitHub UI alone
- [x] 3.4 Add a cleanup step (`if: always()`) that stops the background `api`/`web` processes and runs `docker compose down -v`, so a failed run doesn't leave dangling state for the next job on the same runner

## 4. Validate the workflow actually gates correctly

- [x] 4.1 Push a branch with green e2e specs and open a pull request targeting `develop`; confirm the workflow triggers and the check passes
- [x] 4.2 Temporarily break one assertion in `apps/web/e2e/users.spec.ts` (or `tasks.spec.ts`) on a throwaway branch/PR targeting `develop`; confirm the job fails clearly and for the right reason (not a setup/readiness failure), then revert the change
- [x] 4.3 Open a pull request targeting `main` (e.g. from `develop`) and confirm the same workflow triggers there too

## 5. Enforce the gate via branch protection (requires explicit confirmation before applying to the live repo)

- [x] 5.1 Document the exact steps to require this workflow's check before merging: GitHub repo → Settings → Branches → add/edit a branch protection rule for the branch → enable "Require status checks to pass before merging" → select this workflow's job → save (note the equivalent `gh api repos/:owner/:repo/branches/:branch/protection` call as a reference, but do not assume `gh` is available or already authenticated)
- [x] 5.2 With explicit go-ahead, apply the branch protection rule to `develop`
- [x] 5.3 With explicit go-ahead, apply the branch protection rule to `main`
- [x] 5.4 Confirm enforcement: attempt to merge a pull request with a failing check and verify GitHub's merge button is disabled/blocked
