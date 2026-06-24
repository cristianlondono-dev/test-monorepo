## Why

`apps/api` exposes full CRUD for `users` and `tasks` with no documentation surface at all — the only way to know a route exists, what it expects, or what it can fail with is reading the controller/DTO source. We need a live, browsable API reference (Swagger/OpenAPI) covering every endpoint, its request/response shapes, and its error responses.

## What Changes

- Add `@nestjs/swagger` to `apps/api` and serve interactive Swagger UI (plus the raw OpenAPI JSON) from the running API.
- Annotate `UsersController` and `TasksController` (and `HealthController`) with `@ApiTags`/`@ApiOperation` so every endpoint has a summary and description in the docs.
- Annotate every DTO (`CreateUserDto`, `UpdateUserDto`, `CreateTaskDto`, `UpdateTaskDto`) with `@ApiProperty` (description + example) so request bodies are fully documented, not just typed.
- Document every error response each endpoint can actually produce today (400 validation errors, 404 not found, 409 duplicate email) with a shared error-shape schema, instead of only documenting the happy path.
- **BREAKING (internal only)**: swap `UpdateUserDto`/`UpdateTaskDto` from `@nestjs/mapped-types`'s `PartialType` to `@nestjs/swagger`'s `PartialType`, which also propagates Swagger metadata (the `@nestjs/mapped-types` version doesn't) — same runtime validation behavior, just a different import. `@nestjs/mapped-types` is dropped as a dependency once nothing imports it anymore.

## Capabilities

### New Capabilities
- `api-documentation`: a live OpenAPI/Swagger document and UI for `apps/api`, with every endpoint, request/response shape, and documented error response kept accurate via decorators on the controllers and DTOs that already exist.

### Modified Capabilities
- None — this documents the existing `user-management` and `task-management` API behavior (from `task-management-backend`) as-is; no request/response behavior changes.

## Impact

- **apps/api**: new `@nestjs/swagger` dependency; `main.ts` gains a `SwaggerModule.setup(...)` call; `UsersController`/`TasksController`/`HealthController` gain documentation decorators; every DTO gains `@ApiProperty` decorators; `UpdateUserDto`/`UpdateTaskDto` switch their `PartialType` import; `@nestjs/mapped-types` is removed once unused.
- **apps/web / packages/types**: no changes — this is backend-only documentation tooling, not a contract change.
- **Dependencies**: adds `@nestjs/swagger` (and its `swagger-ui-express`/`@types/swagger-ui-express` transitive deps); removes `@nestjs/mapped-types` once it's no longer imported anywhere.
