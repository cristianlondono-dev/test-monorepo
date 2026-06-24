## Why

The project has no way to register or track tasks assigned between users. We need a backend foundation (users + tasks CRUD) so work can be assigned, given a due date, and marked complete/incomplete, with the data model shared via `@repo/types` so the future frontend can consume it without re-defining types.

## What Changes

- Add a `UsersModule` in `apps/api` with a `User` TypeORM entity (`name`, `lastName`, `email`, `phone`, `indicativeCountry`, `role`) and full CRUD endpoints (`GET/POST/PATCH/DELETE /users`).
- Add a `TasksModule` in `apps/api` with a `Task` TypeORM entity (`name`, `description`, `createdAt`, `dueDate`, `status`) and a many-to-many relation to `User` for one or more assignees (`assignees`).
- Add full CRUD endpoints for tasks (`GET/POST/PATCH/DELETE /tasks`), including a dedicated endpoint/DTO action to toggle a task's `status` between `pending` and `completed` (the "checkbox" behavior).
- Extend `packages/types` with shared interfaces and enums (`User`, `UserRole`, `Task`, `TaskStatus`, plus Create/Update DTO types for both) so the data shapes are typed in one place for any future consumer.
- Register the new entities with the existing TypeORM setup (`autoLoadEntities` is already enabled in `apps/api/src/database/database.module.ts`), and wire both new modules into `AppModule`.
- No changes to `apps/web` in this phase — backend only.

## Capabilities

### New Capabilities
- `user-management`: CRUD of users (`name`, `lastName`, `email`, `phone`, `indicativeCountry`, `role`) with role restricted to `ADMIN`, `MANAGER`, `MEMBER`.
- `task-management`: CRUD of tasks (`name`, `description`, `createdAt`, `dueDate`, `status`, one or more `assignees`) including marking a task as completed/not completed.

### Modified Capabilities
- None — these are net-new capabilities; no existing spec changes behavior.

## Impact

- **apps/api**: new `users` and `tasks` modules (entities, DTOs, services, controllers); `app.module.ts` updated to import them; new Postgres tables `users`, `tasks`, and a `tasks_assignees` join table (via TypeORM `synchronize` in non-production, as already configured).
- **packages/types**: new exported types/enums for `User`, `UserRole`, `Task`, `TaskStatus`, and their Create/Update DTOs, built into the `@repo/types` package consumed by `apps/api`.
- **apps/web**: no changes in this phase.
- **Dependencies**: none beyond what's already installed (`@nestjs/typeorm`, `typeorm`, `pg`, `class-validator`/`class-transformer` if not already present — to be confirmed in design).
