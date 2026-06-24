## Context

`apps/api` (NestJS 11) has three modules — `health`, `users`, `tasks` — with no API documentation tooling installed. DTOs already carry `class-validator` decorators (`@IsEmail`, `@IsEnum`, `@ArrayMinSize`, etc., added in `task-management-backend`), and `Update*Dto` classes are built via `PartialType` from `@nestjs/mapped-types`. The services throw `NotFoundException` (404) and `ConflictException` (409) in specific, known places; the global `ValidationPipe({ whitelist: true, transform: true })` produces 400s for any invalid body. There is no auth on this API yet, and no production deployment exists.

## Goals / Non-Goals

**Goals:**
- Serve interactive Swagger UI and the raw OpenAPI JSON from the running `apps/api`.
- Every controller endpoint has a summary/description (`@ApiOperation`).
- Every DTO field has a description and example (`@ApiProperty`), so request bodies are self-explanatory in the docs, not just typed.
- Every error response an endpoint can actually produce today (400/404/409) is documented against a shared error-shape schema.

**Non-Goals:**
- No new exception types or error-handling behavior — this documents what the services already throw, it doesn't change it.
- No auth/API-key gating of the Swagger UI itself — matches the API's current no-auth scope; flagged as a risk to revisit before any real deployment.
- No changes to `apps/web` or `packages/types` — this is backend documentation tooling only, not a contract change (the OpenAPI doc reflects the existing contract).
- No OpenAPI client/SDK generation for the frontend — out of scope unless asked separately.

## Decisions

**Use `@nestjs/swagger`'s `PartialType`/`OmitType`/`PickType` instead of `@nestjs/mapped-types`'s.**
`@nestjs/mapped-types`'s `PartialType` only propagates `class-validator` metadata to the generated class; it doesn't know about `@nestjs/swagger`'s `@ApiProperty` metadata. `@nestjs/swagger` re-exports its own `PartialType` that propagates *both*, which is the documented, recommended approach for projects using both libraries together. `UpdateUserDto`/`UpdateTaskDto` switch their import; once nothing imports `@nestjs/mapped-types` anymore, it's removed from `apps/api/package.json` rather than left as dead weight.

**Annotate DTOs explicitly with `@ApiProperty({ description, example })` rather than enabling the NestJS CLI Swagger plugin.**
The plugin (configured via `nest-cli.json`) can infer `type`/`required` from TypeScript types and turn JSDoc comments into descriptions, cutting boilerplate — but it can't produce the example values the proposal explicitly asks for, and it's a build-time "magic" transform that only activates under `nest build`/`nest start` (not under `tsc --noEmit` or `ts-jest`), which is an easy thing for a future contributor to be confused by. With only 10 DTO fields total across two `Create*Dto` classes (the `Update*Dto`s inherit via `PartialType`), explicit decorators are a small, one-time cost that keeps documentation fully visible in the source instead of partially inferred.

**A shared `ErrorResponseDto` documents the common NestJS exception body shape, reused across every documented error response.**
Every `HttpException` NestJS throws (validation, `NotFoundException`, `ConflictException`) serializes to the same shape: `{ statusCode: number, message: string | string[], error: string }`. A single `ErrorResponseDto` (in a new `apps/api/src/common/dto/error-response.dto.ts`) is referenced via `@ApiResponse({ status, type: ErrorResponseDto, description })` everywhere, instead of redefining an inline schema per endpoint per status code.

**Document exactly the error statuses each endpoint can actually produce, not a generic "400/404/500 always."**
Derived directly from the service code (see `specs/api-documentation/spec.md` for the per-endpoint breakdown): e.g. `POST /users` documents 400 and 409 (not 404, since there's nothing to "not find" on create); `GET /users` documents only 200 (it can't fail in a way the API distinguishes); `PATCH /tasks/:id` documents 400 and 404 (unknown assignee resolves through the same `NotFoundException` path as a missing task). This keeps the docs honest rather than boilerplate-accurate.

**Swagger UI is served unauthenticated at `/docs` (UI) and `/docs-json` (raw spec), in every environment, for now.**
There's no auth anywhere in this API yet and no production environment in scope — gating Swagger specifically would be inconsistent with the rest of the API's current security posture, not an improvement on it. Flagged as a risk below for when a real deployment is planned. `/docs` is chosen over `/api` to avoid any future collision with a versioned route prefix.

**`DocumentBuilder` metadata (title, description, version) is hardcoded in `main.ts`, not pulled from `package.json`.**
`apps/api/package.json`'s `version` is still the scaffold default (`0.0.1`) and isn't meaningfully versioned yet; hardcoding a short title/description in `main.ts` is simpler than wiring up a version source that doesn't carry real information yet.

## Risks / Trade-offs

- [Risk] Swagger UI is unauthenticated and publicly reachable on any environment this API runs in, fully describing the schema (including the `role` field and all DTOs). → Mitigation: acceptable now (no auth exists anywhere else on this API either, no production deployment yet); revisit alongside whenever auth is added.
- [Risk] Documented error statuses can drift from reality if a service's exception-throwing changes later without updating the corresponding `@ApiResponse`. → Mitigation: no automated enforcement added here (out of scope); the per-endpoint breakdown in the spec file gives a clear reference to check against during future PRs touching these services.
- [Risk] Dropping `@nestjs/mapped-types` could break something if it's imported somewhere outside `users`/`tasks` DTOs. → Mitigation: it's only used by `UpdateUserDto`/`UpdateTaskDto` today (confirmed by reading the current source); removal happens only after the import swap and a workspace-wide grep confirms no remaining usages.

## Migration Plan

1. Add `@nestjs/swagger` to `apps/api`.
2. Add `apps/api/src/common/dto/error-response.dto.ts`.
3. Swap `UpdateUserDto`/`UpdateTaskDto` to `@nestjs/swagger`'s `PartialType`; add `@ApiProperty` to every `Create*Dto` field.
4. Add `@ApiTags`/`@ApiOperation`/`@ApiResponse` to `UsersController`, `TasksController`, `HealthController`.
5. Wire `DocumentBuilder` + `SwaggerModule.setup("docs", ...)` into `main.ts`.
6. Grep the workspace for `@nestjs/mapped-types` usages; remove the dependency if none remain.
7. Run the stack, open `/docs`, manually confirm every endpoint/DTO/error response renders as expected.
8. Run `pnpm --filter api lint`, `pnpm --filter api type-check`, `pnpm --filter api test`.

No production rollout involved; this only adds a docs route to a backend with no deployed environment yet.

## Open Questions

None outstanding — the only real judgment calls (Swagger UI path, env gating, plugin vs. explicit decorators, `PartialType` source) are resolved above as Decisions rather than left open.
