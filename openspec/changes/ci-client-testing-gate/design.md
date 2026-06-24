## Context

`apps/web` already has a working Playwright e2e suite (`apps/web/e2e/users.spec.ts`, `apps/web/e2e/tasks.spec.ts`) added in the `playwright-e2e-testing` change. It's only ever been run manually, against a stack started with `docker compose up -d --build` (Postgres + `apps/api` + `apps/web`) plus `pnpm --filter web test:e2e`. There is no `.github/workflows/` directory yet — this is the first CI workflow in the repo.

The repo has two long-lived branches, `develop` and `main`, both already pushed to GitHub. The request is for two gates that are functionally identical (same test suite, same pass/fail rule) but sit at two different merge points: feature → `develop`, and `develop` → `main`.

`apps/api` uses TypeORM with `synchronize: false` (`apps/api/src/database/database.module.ts:15`), so the schema only exists after running `pnpm --filter api migration:run` — this isn't automatic on container start, and CI needs to do it explicitly before the suite can hit real endpoints.

## Goals / Non-Goals

**Goals:**
- One GitHub Actions workflow, triggered on pull requests targeting `develop` and on pull requests targeting `main`, that runs the existing e2e suite against a real (not mocked) `apps/web` + `apps/api` + Postgres stack.
- The workflow's job fails (non-zero exit) if any spec fails, with no special-casing — this is `playwright test`'s default behavior.
- Clear, copy-pasteable steps for turning that job into an actual merge blocker via GitHub branch protection (required status checks), since the workflow file alone cannot enforce that.
- CI run time and flakiness kept low enough that this doesn't become something people start merging around with admin overrides.

**Non-Goals:**
- Changing or extending the e2e specs themselves (out of scope — "los que ya están funcionando").
- Running `apps/api`'s Jest unit/e2e tests in this gate — the user explicitly scoped this to "el lado del cliente" (client-side). A backend test gate is a separate, future change.
- Running on every push to feature branches (would duplicate cost without a merge decision attached) — scope is pull requests into `develop` and `main` only.
- Automatically applying the branch protection change to the live GitHub repo as part of this implementation — that's a repository-admin setting change, not a code change, and is called out as a separate, explicitly-confirmed step.

## Decisions

### 1. Single workflow file, two branch targets, one job
Use one workflow (`.github/workflows/client-e2e-tests.yml`) with:
```yaml
on:
  pull_request:
    branches: [develop, main]
```
**Why not two separate workflows** (one per branch): the test logic is identical ("los que ya están funcionando" — same suite, same pass/fail rule for both gates). Two copies of the same job would drift over time. A single workflow with both branches listed keeps it DRY; the PR's base branch is already visible in the GitHub UI and in `github.base_ref` if a step ever needs to branch on it.

### 2. Build & run `apps/api` and `apps/web` natively in the runner; only Postgres via Docker
**Decision:** `docker compose up -d db` for Postgres only, then build and start `apps/api` and `apps/web` directly on the GitHub Actions runner (`pnpm turbo run build --filter=api... --filter=web...`, then `pnpm --filter api start` and `pnpm --filter web start` in the background), instead of `docker compose up -d --build` for the full stack.

**Why:** the full-stack `docker compose --build` path the suite was developed against produces high-fidelity production images, but rebuilding both Dockerfiles from scratch on every PR (no layer cache by default on a fresh runner) is slow and adds Docker-in-Docker overhead for no behavioral difference — `next build`/`nest build` run the same code either way. Native runs also reuse `pnpm`/Turborepo's own caching (via `actions/cache` or `actions/setup-node`'s built-in cache) much more easily than Docker layer caching does on hosted runners.

**Trade-off accepted:** this diverges slightly from the exact local repro steps in `findings.md` (`docker compose up -d --build`, full stack). If a CI-only failure ever doesn't reproduce locally, that divergence (containerized vs native process) is the first thing to suspect. Documented here so it's not a mystery later.

**Alternative considered:** full `docker compose up -d --build`. Rejected for CI specifically due to build time; still the recommended way to reproduce a CI failure locally.

### 3. CI gets its own `.env`, not a copy of `.env.example` verbatim
**Decision:** the workflow writes its own `.env` (or exports the equivalent step env vars) with `DATABASE_URL=postgresql://example:example@localhost:5432/example` and `NEXT_PUBLIC_API_URL=http://localhost:4000` — i.e., `localhost`, not the Docker Compose service name `db`.

**Why:** `.env.example`'s `DATABASE_URL` points at host `db`, which only resolves inside the Compose network. Since `apps/api` runs natively on the runner (Decision 2), it talks to Postgres via the port Compose publishes to the host (`localhost:5432`), not the service DNS name. Reusing `.env.example` unmodified would silently fail to connect.

**Values used are the same placeholder credentials already committed in `.env.example`** (`example`/`example`/`example`) — there's nothing secret here; no GitHub Secrets are needed for this workflow.

### 4. Migrations run explicitly as a CI step
**Decision:** add a step that runs `pnpm --filter api migration:run` against the freshly-started Postgres container, after waiting for its healthcheck, before starting `apps/api`.

**Why:** `synchronize: false` means the schema doesn't materialize on its own; this mirrors what a developer has to do locally too (it's just not automated anywhere yet, including locally — out of scope to fix that here, but CI needs to do it regardless).

### 5. Readiness checks instead of fixed sleeps
**Decision:** wait for Postgres via Compose's existing `healthcheck`, and wait for `apps/api`/`apps/web` to actually respond (e.g. polling `curl -sf http://localhost:4000` / `http://localhost:3000` in a retry loop, or `npx wait-on`) instead of a blind `sleep N`.

**Why:** fixed sleeps are the single biggest source of CI flakiness in setups like this — too short and the suite starts hammering a server that isn't ready yet (spurious failures that erode trust in the gate); too long and every PR pays for the worst case. A retry/poll loop with a timeout fails fast and predictably when something is actually broken, and doesn't waste time when the stack comes up quickly.

### 6. Reuse the suite's existing defaults — no new required configuration
`apps/web/playwright.config.ts` already defaults `E2E_BASE_URL` to `http://localhost:3000`, and `apps/web/e2e/helpers.ts` defaults `E2E_API_URL` to `http://localhost:4000`. Running `api` on `4000` and `web` on `3000` in CI (same as `.env.example`'s `API_PORT`/`WEB_PORT`) means the workflow doesn't need to set either env var explicitly — one less thing to keep in sync between the suite and the workflow.

### 7. Branch protection is documented and applied as an explicit, separate step — not silently bundled into "done"
**Decision:** tasks.md includes the exact settings (UI steps and the equivalent `gh api`/REST call) to require this workflow's check before merging into `develop` and `main`, but applying it to the live repository is called out as a step requiring the user's explicit go-ahead, done by the user (or by an agent acting on direct instruction) — not assumed as part of "implement the workflow file."

**Why:** the workflow YAML by itself does not block anything — GitHub merges pull requests regardless of check status unless a branch protection rule with "Require status checks to pass before merging" names that check. That's an org/repo-admin-level setting affecting every contributor's ability to merge into two shared branches, so it follows the same bar as any other shared-state change: propose it, then apply it only with explicit confirmation.

## Risks / Trade-offs

- **[Risk]** Native build/start (Decision 2) behaves slightly differently from the production Docker image (e.g. env var baking, file permissions, `NODE_ENV`) → **Mitigation:** explicitly set `NODE_ENV=production` and `NEXT_PUBLIC_API_URL` for the native build step too, matching what the Dockerfiles bake in; call out the divergence in this doc (Decision 2) so a "works in CI, fails in prod image" report isn't a mystery.
- **[Risk]** E2E suites are inherently more flaking-prone than unit tests (timing, network, browser quirks) — a flaky required check trains people to re-run-until-green or bypass it → **Mitigation:** keep the job to a single retry-free run initially and watch actual flake rate before adding `retries` in `playwright.config.ts` or workflow-level re-run logic; don't pre-solve a problem that hasn't been observed yet.
- **[Risk]** Migrations step assumes `apps/api/src/database/migrations` is always up to date and applies cleanly to a fresh database — if a feature branch has an unmerged/broken migration, the gate fails for a reason unrelated to the e2e specs themselves → **Mitigation:** this is arguably correct behavior (a broken migration shouldn't merge either), but the failure message from `typeorm migration:run` should be visible in the job logs, not swallowed, so it's clearly distinguishable from an actual Playwright assertion failure.
- **[Risk]** Requiring this check on `develop` blocks every feature-branch PR on e2e infra health, not just on the feature's own correctness — if the shared stack setup breaks (e.g. a Postgres image update), all merges into `develop` stop → **Mitigation:** accepted as the intended behavior per the user's request ("si por lo menos uno de los test sale con error, no se debe permitir hacer el merge"); pin the Postgres image tag already used in `docker-compose.yml` (`postgres:16-alpine`) so it doesn't drift unexpectedly.

## Migration Plan

1. Add the workflow file; it starts running (and reporting status) on the next PR into `develop` or `main`, but merging is **not yet blocked** by it (no branch protection configured yet) — this is a deliberate soft-launch so the workflow's reliability can be observed for real PRs before it can block anyone.
2. Once a few real runs look stable (consistent pass/fail matching reality, runtime acceptable), apply the branch protection rule from task 5 (explicit confirmation step) to actually enforce the gate.
3. Rollback: branch protection can be removed/edited from GitHub repo settings in one click if the gate turns out to be too flaky to keep as a hard blocker; the workflow file can be disabled independently (or deleted) without touching branch protection separately if needed.

## Open Questions

- Should `develop` also require the workflow to pass on **push** (not just PR), to catch a direct push or an admin-merged PR that skipped checks? Left out for now — the user described pull-request merges specifically.
- Should `apps/api`'s existing Jest suite (`pnpm --filter api test`) be added as a second required check later? Out of scope here per the "lado del cliente" framing, but the workflow structure (one job per stack layer) makes it straightforward to add as a parallel job in the future.
