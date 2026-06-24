## Why

The backend CRUD for users and tasks (`task-management-backend`) has no client yet — there's no way to actually view, assign, or manage anything without calling the API directly. This change builds the minimal, intuitive `apps/web` interface on top of it: list users and tasks, manage users (edit/delete), and run the full flow to create a task (assign to one or more users, set its due date and description) and manage it afterward (edit, delete, toggle complete/pending).

## What Changes

- Add a `/users` page: a table listing all users, with an "edit" button per row that opens a drawer with a form to update that user's data, and a delete button (trash icon) per row.
- Add a "new user" entry point (button) that opens the same drawer in create mode, since a usable user list needs a way to populate it.
- Add a `/tasks` page: a list of all tasks showing name, description, due date, and assignees, each with a checkbox to toggle `status` between `completed` and `pending`, an edit button (drawer) to change name/description/due date/assignees, and a delete button (trash icon).
- Add a "new task" entry point that opens a drawer/form to create a task: pick one or more assignees from existing users, set the due date, and write the description (the "assign tasks to users" flow).
- Add typed API client functions in `apps/web/src/lib/api.ts` for all `users`/`tasks` CRUD endpoints, reusing the `@repo/types` shapes already defined for the backend.
- Add minimal shared UI building blocks needed by both pages (a `Drawer` and a `Checkbox`/trash-icon button), with no new UI/icon library dependency.

## Capabilities

### New Capabilities
- `user-management-ui`: list, create, edit (via drawer), and delete users from `apps/web`.
- `task-management-ui`: list, create (assign to user(s) + due date + description), edit (via drawer), delete, and toggle the completed/pending status of tasks from `apps/web`.

### Modified Capabilities
- None — this only adds a client on top of the existing `task-management-backend` API; no backend requirement changes.

## Impact

- **apps/web**: new `src/app/users/page.tsx` and `src/app/tasks/page.tsx` routes, new reusable components (`Drawer`, user/task forms, tables/lists), extended `src/lib/api.ts` with CRUD calls to `apps/api`.
- **apps/api**: no changes — consumes the existing `users`/`tasks` endpoints as-is.
- **packages/types**: no changes expected — reuses `User`, `UserRole`, `Task`, `TaskStatus`, and the existing Create/Update DTO types.
- **Dependencies**: none added; built with the existing stack (Next.js App Router, React 19, Tailwind CSS 4, plain `fetch`), consistent with `apps/web`'s current no-extra-library footprint.
