## 1. Setup

- [x] 1.1 Add `@nestjs/swagger` to `apps/api/package.json` and install
- [x] 1.2 Add `apps/api/src/common/dto/error-response.dto.ts` with `@ApiProperty`-decorated `statusCode`, `message`, `error` fields matching NestJS's default exception body shape

## 2. DTO documentation

- [x] 2.1 Add `@ApiProperty({ description, example })` to every field in `CreateUserDto`
- [x] 2.2 Add `@ApiProperty({ description, example })` to every field in `CreateTaskDto`
- [x] 2.3 Switch `UpdateUserDto`'s `PartialType` import from `@nestjs/mapped-types` to `@nestjs/swagger`
- [x] 2.4 Switch `UpdateTaskDto`'s `PartialType` import from `@nestjs/mapped-types` to `@nestjs/swagger`
- [x] 2.5 Grep the workspace for remaining `@nestjs/mapped-types` usages; remove the dependency from `apps/api/package.json` if none remain

## 3. Controller documentation

- [x] 3.1 Add `@ApiTags("users")` and `@ApiOperation` (summary + description) to every `UsersController` route; add `@ApiResponse` for its success status and exactly the error statuses from `specs/api-documentation/spec.md` (`POST`: 400/409; `GET /:id`, `PATCH`, `DELETE`: 404; `PATCH`: also 400/409; `GET`: none)
- [x] 3.2 Add `@ApiTags("tasks")` and `@ApiOperation` to every `TasksController` route; add `@ApiResponse` for its success status and exactly the error statuses from the spec (`POST`: 400/404; `GET /:id`, `PATCH`, `DELETE`: 404; `PATCH`: also 400; `GET`: none)
- [x] 3.3 Add `@ApiTags("health")` and `@ApiOperation` to `HealthController`'s route (success only, no error responses)

## 4. Swagger bootstrap

- [x] 4.1 Wire `DocumentBuilder` (title, description, version) and `SwaggerModule.setup("docs", app, document)` into `apps/api/src/main.ts`

## 5. Verification

- [x] 5.1 Start the local stack and open `http://localhost:4000/docs`; confirm every `users`/`tasks`/`health` endpoint is listed with a summary
- [x] 5.2 Confirm `GET /docs-json` returns a valid OpenAPI document; spot-check that `CreateUserDto`/`CreateTaskDto` schemas show descriptions and examples for every field
- [x] 5.3 Spot-check the documented error responses against `specs/api-documentation/spec.md`'s per-endpoint scenarios (e.g. `POST /users` shows 400/409, `GET /users` shows no error responses)
- [x] 5.4 Run `pnpm --filter api lint`, `pnpm --filter api type-check`, and `pnpm --filter api test`
