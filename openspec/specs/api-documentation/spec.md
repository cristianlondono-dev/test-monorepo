# api-documentation Specification

## Purpose
TBD - created by archiving change api-swagger-docs. Update Purpose after archive.

## Requirements
### Requirement: Swagger UI and OpenAPI document are served
`apps/api` SHALL serve an interactive Swagger UI and the raw OpenAPI JSON document describing every registered endpoint.

#### Scenario: UI loads
- **WHEN** a client sends `GET /docs`
- **THEN** the API returns the Swagger UI HTML page listing the `users`, `tasks`, and `health` endpoints

#### Scenario: Raw OpenAPI document is available
- **WHEN** a client sends `GET /docs-json`
- **THEN** the API returns a valid OpenAPI document whose `paths` include every `users`, `tasks`, and `health` route

### Requirement: Every endpoint has a documented operation summary
Each route on `UsersController`, `TasksController`, and `HealthController` SHALL have a non-empty operation summary/description in the OpenAPI document.

#### Scenario: Each endpoint is described
- **WHEN** inspecting the OpenAPI document's `paths`
- **THEN** every operation (`POST`/`GET`/`PATCH`/`DELETE` under `/users` and `/tasks`, `GET /health`) has a non-empty `summary`

### Requirement: Every DTO field is documented with a description and example
`CreateUserDto` and `CreateTaskDto` SHALL expose a `description` and an `example` for every property in the OpenAPI component schemas; `UpdateUserDto` and `UpdateTaskDto` SHALL inherit the same documentation for the fields they share with their `Create*Dto`.

#### Scenario: Create DTOs are fully documented
- **WHEN** inspecting the OpenAPI document's component schema for `CreateUserDto` and `CreateTaskDto`
- **THEN** every property has both a `description` and an `example` value

#### Scenario: Update DTOs inherit documentation
- **WHEN** inspecting the OpenAPI document's component schema for `UpdateUserDto` and `UpdateTaskDto`
- **THEN** every inherited property retains the `description` and `example` of its corresponding `Create*Dto` field

### Requirement: Documented error responses match what each endpoint can actually return
Each endpoint SHALL document exactly the error status codes its service logic can produce today, each referencing a shared error-response schema, rather than a generic fixed set.

#### Scenario: User creation documents validation and conflict errors
- **WHEN** inspecting the OpenAPI document for `POST /users`
- **THEN** it documents a `201` success response plus `400` (validation failure) and `409` (duplicate email) error responses, each using the shared error schema

#### Scenario: User read/update/delete document not-found
- **WHEN** inspecting the OpenAPI document for `GET /users/{id}`, `PATCH /users/{id}`, and `DELETE /users/{id}`
- **THEN** each documents a `404` error response using the shared error schema, alongside its success response

#### Scenario: User update documents conflict in addition to not-found
- **WHEN** inspecting the OpenAPI document for `PATCH /users/{id}`
- **THEN** it documents `400`, `404`, and `409` error responses

#### Scenario: List endpoints document only their success response
- **WHEN** inspecting the OpenAPI document for `GET /users` and `GET /tasks`
- **THEN** each documents only its `200` response, with no error responses listed

#### Scenario: Task creation documents validation and unknown-assignee errors
- **WHEN** inspecting the OpenAPI document for `POST /tasks`
- **THEN** it documents a `201` success response plus `400` (validation failure, including the at-least-one-assignee rule) and `404` (unknown assignee id) error responses

#### Scenario: Task read/update/delete document not-found
- **WHEN** inspecting the OpenAPI document for `GET /tasks/{id}`, `PATCH /tasks/{id}`, and `DELETE /tasks/{id}`
- **THEN** each documents a `404` error response using the shared error schema, and `PATCH /tasks/{id}` additionally documents `400`

#### Scenario: Health endpoint documents only its success response
- **WHEN** inspecting the OpenAPI document for `GET /health`
- **THEN** it documents only its `200` response, since the health check never throws
