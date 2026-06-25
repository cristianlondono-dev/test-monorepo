## ADDED Requirements

### Requirement: Playwright MCP server registered for the project
The repository SHALL declare the Playwright MCP server in a project-scoped MCP configuration file, so it is available to any Claude Code session working in this project after one-time user approval.

#### Scenario: MCP server is discoverable
- **WHEN** a Claude Code session starts in this repository
- **THEN** a `playwright` MCP server entry is present in the project's MCP configuration, launching `@playwright/mcp` via `npx`

### Requirement: Playwright Test runnable against apps/web
`apps/web` SHALL have `@playwright/test` configured with a script that runs the e2e suite against a configurable base URL, defaulting to the local stack.

#### Scenario: Running the suite locally
- **WHEN** a developer runs `pnpm --filter web test:e2e` with the Docker stack (`docker compose up -d --build`) already running
- **THEN** Playwright launches Chromium, executes every spec under `apps/web/e2e/`, and reports pass/fail per test

#### Scenario: Base URL is configurable
- **WHEN** a developer sets `E2E_BASE_URL` and `E2E_API_URL` environment variables before running the suite
- **THEN** the suite navigates against `E2E_BASE_URL` and seeds/cleans up data against `E2E_API_URL` instead of the defaults

### Requirement: Tests seed and clean up their own data
Each e2e spec SHALL create any `User`/`Task` data it needs via direct API calls before its assertions and remove that data afterward, so the suite does not leave residual rows in the shared dev database.

#### Scenario: Spec cleans up after itself
- **WHEN** a spec creates one or more users or tasks to exercise a UI flow
- **THEN** those same users/tasks are deleted via the API by the end of that spec, regardless of whether the test passed or failed
