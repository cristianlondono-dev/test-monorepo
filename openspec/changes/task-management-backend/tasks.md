## 1. Dependencies & global setup

- [x] 1.1 Add `class-validator`, `class-transformer`, `@nestjs/mapped-types`, and `dotenv` to `apps/api/package.json` and install
- [x] 1.2 Add `typeorm`/`migration:generate`/`migration:run`/`migration:revert` scripts to `apps/api/package.json` using the `typeorm-ts-node-commonjs` CLI
- [x] 1.3 Enable a global `ValidationPipe({ whitelist: true, transform: true })` in `apps/api/src/main.ts`

## 2. Shared types (`@repo/types`)

- [x] 2.1 Add `UserRole` enum (`ADMIN`, `MANAGER`, `MEMBER`) and rewrite `User`/`CreateUserDto`/`UpdateUserDto` in `packages/types/src/user.ts` with `name`, `lastName`, `email`, `phone`, `indicativeCountry`, `role`
- [x] 2.2 Add `TaskStatus` enum (`pending`, `completed`) and `Task`/`CreateTaskDto`/`UpdateTaskDto` in new `packages/types/src/task.ts`, including `assigneeIds`/`assignees` shapes
- [x] 2.3 Export the new `task.ts` module from `packages/types/src/index.ts`
- [x] 2.4 Rebuild `@repo/types` (`pnpm --filter @repo/types build`) and confirm `dist/index.d.ts` includes the new types

## 3. Users module

- [x] 3.1 Create `User` entity at `apps/api/src/users/user.entity.ts`: `id` (uuid), `name`, `lastName`, `email` (unique), `phone`, `indicativeCountry`, `role` (enum column), `createdAt`, `updatedAt`, and inverse `assignedTasks: Task[]`
- [x] 3.2 Create `CreateUserDto` and `UpdateUserDto` (via `PartialType`) in `apps/api/src/users/dto/`, implementing the `@repo/types` interfaces and validated with `class-validator` (`@IsEmail`, `@IsEnum(UserRole)`, `@IsNotEmpty`, etc.)
- [x] 3.3 Create `UsersService` with `create`, `findAll`, `findOne`, `findByIds`, `update`, `remove`, enforcing unique email on create/update and throwing not-found errors for missing ids
- [x] 3.4 Create `UsersController` with `POST /users`, `GET /users`, `GET /users/:id`, `PATCH /users/:id`, `DELETE /users/:id`
- [x] 3.5 Create `UsersModule` registering the `User` entity via `TypeOrmModule.forFeature` and exporting `UsersService` for reuse by `TasksModule`
- [x] 3.6 Add `users.service.spec.ts` covering the unique-email check and the not-found paths

## 4. Tasks module

- [x] 4.1 Create `Task` entity at `apps/api/src/tasks/task.entity.ts`: `id` (uuid), `name`, `description`, `createdAt` (auto), `dueDate`, `status` (enum column, default `pending`), and `assignees: User[]` via `@ManyToMany(() => User) @JoinTable({ name: "tasks_assignees" })`
- [x] 4.2 Create `CreateTaskDto` and `UpdateTaskDto` (via `PartialType`) in `apps/api/src/tasks/dto/`, with `assigneeIds: string[]` validated as a non-empty UUID array, and `@IsEnum(TaskStatus)` for `status`
- [x] 4.3 Create `TasksService`: `create` resolves `assigneeIds` via `UsersService.findByIds` (rejects unknown ids), `findAll`/`findOne` return tasks with the `assignees` relation loaded, `update` re-resolves `assigneeIds` when provided, `remove` deletes the task
- [x] 4.4 Create `TasksController` with `POST /tasks`, `GET /tasks`, `GET /tasks/:id`, `PATCH /tasks/:id`, `DELETE /tasks/:id`
- [x] 4.5 Create `TasksModule` importing `UsersModule` (to resolve assignees) and registering the `Task` entity via `TypeOrmModule.forFeature`
- [x] 4.6 Add `tasks.service.spec.ts` covering assignee resolution on create/update

## 5. Migrations & wiring

- [x] 5.1 Add `apps/api/src/database/data-source.ts` (plain `DataSource`, `dotenv/config`, entities/migrations globs) for the TypeORM CLI
- [x] 5.2 Start Postgres (`docker compose up -d db`) and run `migration:generate` to create the initial migration for `users`, `tasks`, `tasks_assignees`; commit the generated file under `apps/api/src/database/migrations/`
- [x] 5.3 Update `apps/api/src/database/database.module.ts`: `synchronize: false`, `migrationsRun: true`, `migrations` glob pointing at `database/migrations/*{.ts,.js}`
- [x] 5.4 Register `UsersModule` and `TasksModule` in `apps/api/src/app.module.ts`
- [x] 5.5 Boot the app locally and confirm the migration runs automatically and creates the `users`, `tasks`, and `tasks_assignees` tables

## 6. Verification

- [x] 6.1 Start the local stack (Postgres via Docker + `pnpm dev`)
- [x] 6.2 Exercise the full Users CRUD (create, list, get, update, delete), confirming duplicate-email and invalid-role requests are rejected per `specs/user-management/spec.md`
- [x] 6.3 Exercise the full Tasks CRUD (create, list, get, update, delete) and the completed/pending status toggle, confirming empty/unknown-assignee requests are rejected per `specs/task-management/spec.md`
- [x] 6.4 Run `pnpm --filter api lint`, `pnpm --filter api type-check`, and `pnpm --filter api test`
