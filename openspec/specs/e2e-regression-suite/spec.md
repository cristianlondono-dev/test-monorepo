# e2e-regression-suite

## Purpose

TBD - Defines the end-to-end browser regression coverage for the core `/users` and `/tasks` flows in `apps/web`, and the convention for recording known product bugs discovered while writing or running that coverage instead of silently dropping or weakening tests.

## Requirements

### Requirement: Users flow coverage
`apps/web/e2e/users.spec.ts` SHALL cover creating a user via the drawer, editing an existing user via the drawer, and deleting a user from the table.

#### Scenario: Create, edit, delete a user end-to-end
- **WHEN** the suite runs `users.spec.ts`
- **THEN** it drives the browser to create a new user through the "Nuevo usuario" drawer, verifies it appears in the table, edits one of its fields through the edit drawer, verifies the change is reflected, deletes it, and verifies it no longer appears

### Requirement: Tasks flow coverage
`apps/web/e2e/tasks.spec.ts` SHALL cover creating a task with multiple assignees, editing a task, toggling its completion checkbox in both directions, and deleting a task.

#### Scenario: Create with multiple assignees, toggle, edit, delete
- **WHEN** the suite runs `tasks.spec.ts`
- **THEN** it drives the browser to create a task assigning two existing users with a due date and description, verifies both assignees appear, checks the status checkbox and verifies the task renders as completed, unchecks it and verifies it renders as pending again, edits the task through the drawer, and deletes it

### Requirement: Known-broken flows are marked, not silently dropped
Any scripted flow found to fail because of a real product bug (discovered while writing the suite or during the exploratory MCP session) SHALL be marked with `test.fixme()` and a comment referencing the matching entry in `findings.md`, rather than deleted, weakened, or left as an unexplained failing test.

#### Scenario: A known bug is encountered while writing a spec
- **WHEN** a scripted assertion fails because of a genuine bug in `/users` or `/tasks` rather than a mistake in the test
- **THEN** the test is annotated with `test.fixme()` and a comment pointing to its corresponding entry in `findings.md`, and the bug is recorded there with repro steps
