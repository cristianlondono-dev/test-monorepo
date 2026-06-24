## Context

`apps/api` is a NestJS 11 app with TypeORM + Postgres already wired up (`apps/api/src/database/database.module.ts`), with `autoLoadEntities: true` and `synchronize` enabled outside production. The only existing feature module is `health` (controller + service + module, no entity, no DTOs). There is no global `ValidationPipe`, no `class-validator`/`class-transformer`, no `@nestjs/mapped-types`, and no TypeORM CLI/migration setup yet, because no module has needed request-body validation or persisted entities so far.

The project's backend convention doc (`apps/api/.claude/agents/backend-specialist.md`) is explicit that `synchronize` is only for "desarrollo inicial sin entidades" and that as soon as real entities exist, the project must switch to TypeORM migrations and disable `synchronize` permanently, even in dev. `User` and `Task` are the first real entities being added, so that switch happens as part of this change. The same convention doc also shows the actual on-disk pattern for a feature module: entity files live flat inside the resource directory (e.g. `user.entity.ts`), not under an `entities/` subfolder.

`packages/types` (`@repo/types`) currently exports a placeholder `User`/`CreateUserDto` and `ApiResponse`/`PaginatedResult`/`HealthStatus`. The placeholder `User` type is not imported anywhere in `apps/api` or `apps/web`, so it can be replaced outright. The package is built with `tsup` to `dist/`, and consumers (`apps/api`) resolve `@repo/types` to that build output, not to `src/` directly.

This change is backend-only: `apps/web` is not touched.

## Goals / Non-Goals

**Goals:**
- Full CRUD for `User` and `Task` in `apps/api`, with tasks supporting one or more assignees (users).
- A "checkbox" toggle between completed/not-completed, modeled as a `status` field with two values, updatable through the normal task update endpoint.
- All request/response shapes for `User` and `Task` defined once in `@repo/types` and reused by the API's entities/DTOs, so a future frontend can import the same types.
- Request body validation (required fields, email format, enum values) at the controller boundary.

**Non-Goals:**
- Authentication/authorization. `role` is stored on `User` but nothing enforces permissions based on it yet.
- Pagination/filtering on list endpoints. `GET /users` and `GET /tasks` return full arrays for now; `PaginatedResult<T>` in `@repo/types` stays unused until a real need arises.
- A general-purpose migration workflow beyond what's needed to ship these two entities (e.g. no rollback tooling/CI gate is being built — just the standard TypeORM CLI commands).
- Any `apps/web` UI work.

## Decisions

**Module layout mirrors `health`, entity files flat in the resource directory, DTOs in a `dto/` subfolder.**
`apps/api/src/users/{users.module.ts, users.controller.ts, users.service.ts, user.entity.ts, dto/create-user.dto.ts, dto/update-user.dto.ts}`, and the equivalent under `apps/api/src/tasks/`. Matches the layout shown in `apps/api/.claude/agents/backend-specialist.md` and the `resource` skill (`apps/api/.claude/skills/resource/SKILL.md`) rather than introducing an `entities/` subfolder.

**Switch from `synchronize` to TypeORM migrations, with `migrationsRun: true`.**
Per the backend-specialist convention, `synchronize` is disabled unconditionally (no longer tied to `NODE_ENV`) the moment real entities exist. A standalone `apps/api/src/database/data-source.ts` (a plain `DataSource`, loading `DATABASE_URL` via `dotenv/config`) is added for the TypeORM CLI (`migration:generate`/`migration:run`/`migration:revert` scripts using the `typeorm-ts-node-commonjs` bin), separate from the `TypeOrmModule.forRootAsync` config the running app uses. The running app gets `synchronize: false`, a `migrations` glob pointing at `apps/api/src/database/migrations/*{.ts,.js}`, and `migrationsRun: true` — migrations apply automatically when the API boots (`pnpm dev`), so local dev needs no extra manual step, matching how `synchronize` used to "just work." The initial migration (covering `users`, `tasks`, `tasks_assignees`) is generated once the entities are written and committed alongside them.

**`Task.status` is a two-value enum (`pending` / `completed`), not a plain boolean.**
The user explicitly calls it "status" while describing checkbox (toggle) behavior. An enum satisfies both: it reads as a status field today and leaves room to add a value later (e.g. `in_progress`) without a schema rename. Toggling is just a normal `PATCH /tasks/:id` with `{ "status": "completed" }` in the body — no dedicated toggle endpoint, since the generic update already covers it.

**Assignees are a many-to-many relation (`Task` ↔ `User`), owned by `Task`.**
`Task.assignees: User[]` via `@ManyToMany(() => User) @JoinTable({ name: "tasks_assignees" })`. This matches "responsable o responsables" (one or more) directly, avoids a separate join entity since no extra metadata (e.g. assigned-at timestamp) was requested, and lets a `User` be looked up for their tasks via the inverse `@ManyToMany(() => Task) assignedTasks: Task[]` side if ever needed.

**`CreateTaskDto` requires at least one assignee (`assigneeIds: string[]`, non-empty).**
A task with zero responsables doesn't make sense per the request ("registro de tareas entre usuarios"). Enforced with `@ArrayMinSize(1)` plus `@IsUUID(undefined, { each: true })`.

**Add `class-validator`, `class-transformer`, and `@nestjs/mapped-types` to `apps/api`, and enable a global `ValidationPipe`.**
None of these exist in the project yet because `health` has no request body. `ValidationPipe({ whitelist: true, transform: true })` in `main.ts` is the standard NestJS approach and validates `Create*Dto`/`Update*Dto` automatically. `Update*Dto` is built with `PartialType(Create*Dto)` from `@nestjs/mapped-types` to avoid re-declaring every field as optional by hand.

**`@repo/types` stays framework-agnostic; entities are not the source of shared types.**
`packages/types/src/user.ts` and the new `packages/types/src/task.ts` export plain interfaces/enums (`UserRole`, `User`, `CreateUserDto`, `UpdateUserDto`, `TaskStatus`, `Task`, `CreateTaskDto`, `UpdateTaskDto`) with no TypeORM decorators. The NestJS DTO classes in `apps/api` implement the matching `@repo/types` interface (e.g. `class CreateUserDto implements CreateUserDtoType`) so the decorated class and the shared type are kept in sync by the compiler, but `@repo/types` itself never depends on `typeorm` — this keeps it safe to import from `apps/web` later.

**`indicativeCountry` is a plain string (e.g. `"+57"`), `role` is the enum `ADMIN | MANAGER | MEMBER`.**
Per earlier clarification: no country catalog/ISO code needed right now; role has three fixed levels validated with `@IsEnum(UserRole)`.

**`User.email` is unique at the database level (`@Column({ unique: true })`) and validated with `@IsEmail()`.**
Prevents duplicate accounts; matches normal expectations for an email field without being asked to design a full auth system.

## Risks / Trade-offs

- [Risk] Deleting a `User` who is the only assignee on a `Task` leaves that task with an empty `assignees` array (TypeORM many-to-many delete just removes the join rows, it does not cascade to `Task`). → Mitigation: out of scope for this phase; acceptable since there's no reassignment/ownership-transfer flow requested. Revisit if orphaned tasks become a real problem.
- [Risk] Adding a global `ValidationPipe` affects every existing/future endpoint, including `health`. → Mitigation: `health` has no `@Body()`/DTO, so behavior is unchanged; confirm with existing `app.controller.spec.ts`/e2e tests after wiring it in.
- [Risk] `@repo/types` is consumed from its built `dist/` output, so editing `packages/types/src/*.ts` alone does not update what `apps/api` sees. → Mitigation: rebuild the package (`pnpm --filter @repo/types build`, or rely on `pnpm dev`'s turbo watch) before/while implementing the API modules; called out explicitly in `tasks.md`.
- [Risk] `migrationsRun: true` means the API will attempt to apply pending migrations on every boot, including in a misconfigured environment. → Mitigation: acceptable for this stage (no deployed environment yet); the CLI scripts (`migration:generate`/`migration:run`/`migration:revert`) remain available for running migrations out-of-band if that's ever needed.
- [Risk] Generating the initial migration requires a live Postgres connection (TypeORM diffs the DB against the entities), so it can't be done without first starting the Docker Postgres container. → Mitigation: documented as an explicit task in `tasks.md` (`docker compose up -d db` before `migration:generate`).

## Migration Plan

1. Add `class-validator`, `class-transformer`, `@nestjs/mapped-types`, and `dotenv` to `apps/api` dependencies; add `typeorm`/`migration:*` CLI scripts.
2. Extend `packages/types` (`user.ts`, new `task.ts`, `index.ts`) and rebuild the package.
3. Implement the `users` module (entity, DTOs, service, controller), then the `tasks` module (entity with the many-to-many relation, DTOs, service, controller).
4. Add `apps/api/src/database/data-source.ts` for the CLI; start Postgres (`docker compose up -d db`) and run `migration:generate` to create the initial migration covering `users`, `tasks`, `tasks_assignees`.
5. Update `database.module.ts`: `synchronize: false`, `migrationsRun: true`, `migrations` glob pointing at the new `migrations/` folder.
6. Register `UsersModule` and `TasksModule` in `apps/api/src/app.module.ts`; enable the global `ValidationPipe` in `apps/api/src/main.ts`.
7. Run the local stack (Postgres via Docker + `pnpm dev`) and manually verify each CRUD endpoint, including the status toggle and assigning multiple users to a task, and that the migration applied automatically on boot.

No production rollout is involved yet (no deployed environment in scope); rollback is `migration:revert` plus reverting the commits.

## Open Questions

- Should `role` start enforcing any authorization (e.g. only `ADMIN`/`MANAGER` can create tasks for others) now, or purely stored for later? Assumed: purely stored for now — no auth system exists yet to enforce it against.
- Should a `Task` be allowed to keep existing if all its assignees are deleted, or should deleting a `User` be blocked while they're still assigned to tasks? Assumed: allow deletion, leaving the task with fewer assignees (see Risks).
