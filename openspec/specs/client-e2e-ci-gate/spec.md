# client-e2e-ci-gate

## Purpose

Provide an automated CI gate that runs the existing client-side Playwright e2e suite (`apps/web/e2e/*.spec.ts`) against a real stack (Postgres, `apps/api`, `apps/web`) on every pull request targeting `develop` or `main`, and blocks merging those pull requests while the check has not passed.

## Requirements

### Requirement: Workflow runs on pull requests into develop and main
The system SHALL run a GitHub Actions workflow on every pull request whose base branch is `develop` or `main`.

#### Scenario: Pull request opened against develop
- **WHEN** a pull request is opened or updated with `develop` as the base branch
- **THEN** the client e2e workflow starts a run for that pull request

#### Scenario: Pull request opened against main
- **WHEN** a pull request is opened or updated with `main` as the base branch
- **THEN** the client e2e workflow starts a run for that pull request

#### Scenario: Pull request opened against an unrelated branch
- **WHEN** a pull request is opened with a base branch other than `develop` or `main` (e.g. a feature branch)
- **THEN** the client e2e workflow does not start a run for that pull request

### Requirement: Workflow runs the existing client-side e2e suite against a real stack
The system SHALL provision Postgres, run database migrations, build and start `apps/api` and `apps/web`, and execute the existing Playwright suite (`apps/web/e2e/*.spec.ts`) via `pnpm --filter web test:e2e` — without modifying the suite's existing specs.

#### Scenario: Stack is ready before tests run
- **WHEN** the workflow run begins
- **THEN** Postgres becomes healthy, migrations are applied, and `apps/api` and `apps/web` both respond to requests before any Playwright spec executes

#### Scenario: All specs pass
- **WHEN** every spec in `apps/web/e2e/` passes against the running stack
- **THEN** the workflow job completes with a success status

### Requirement: A single failing test fails the job
The system SHALL report the workflow job as failed if at least one test in the e2e suite fails, with no automatic retry that masks the failure.

#### Scenario: One spec fails
- **WHEN** at least one test in `apps/web/e2e/` fails during a workflow run
- **THEN** the workflow job's overall status is failure

#### Scenario: Stack fails to become ready
- **WHEN** Postgres, `apps/api`, or `apps/web` does not become ready within the workflow's timeout
- **THEN** the workflow job fails with a clearly distinguishable error (readiness/setup failure) before attempting to run Playwright specs

### Requirement: Failing the required check blocks merging into develop and main
Once branch protection is configured for this workflow's check, the system SHALL prevent merging a pull request into `develop` or `main` while that check has not passed.

#### Scenario: Check is failing
- **WHEN** the client e2e workflow's check is in a failed state on a pull request targeting `develop` or `main`
- **THEN** GitHub blocks merging that pull request until the check passes (after branch protection is enabled for the check, per the documented setup steps)

#### Scenario: Check is passing
- **WHEN** the client e2e workflow's check has passed on a pull request targeting `develop` or `main`
- **THEN** that check no longer blocks the merge (other required checks, if any, still apply independently)
