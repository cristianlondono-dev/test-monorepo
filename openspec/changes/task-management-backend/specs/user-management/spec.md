## ADDED Requirements

### Requirement: Create User
The system SHALL allow creating a `User` with `name`, `lastName`, `email`, `phone`, `indicativeCountry`, and `role`. `email` MUST be a valid email address and unique across all users. `role` MUST be one of `ADMIN`, `MANAGER`, `MEMBER`. All fields are required.

#### Scenario: Successful creation
- **WHEN** a client sends `POST /users` with valid `name`, `lastName`, `email`, `phone`, `indicativeCountry`, and `role`
- **THEN** the system creates the user and returns it with a generated `id`

#### Scenario: Duplicate email rejected
- **WHEN** a client sends `POST /users` with an `email` that already belongs to an existing user
- **THEN** the system rejects the request without creating a second user

#### Scenario: Missing required field rejected
- **WHEN** a client sends `POST /users` without one of `name`, `lastName`, `email`, `phone`, `indicativeCountry`, or `role`
- **THEN** the system rejects the request and does not create a user

#### Scenario: Invalid role rejected
- **WHEN** a client sends `POST /users` with a `role` value that is not `ADMIN`, `MANAGER`, or `MEMBER`
- **THEN** the system rejects the request and does not create a user

### Requirement: List Users
The system SHALL allow retrieving the full list of users.

#### Scenario: List returns all users
- **WHEN** a client sends `GET /users`
- **THEN** the system returns an array containing every existing user

### Requirement: Retrieve User by id
The system SHALL allow retrieving a single user by its `id`.

#### Scenario: User found
- **WHEN** a client sends `GET /users/:id` with the `id` of an existing user
- **THEN** the system returns that user's data

#### Scenario: User not found
- **WHEN** a client sends `GET /users/:id` with an `id` that does not match any existing user
- **THEN** the system responds with a not-found error

### Requirement: Update User
The system SHALL allow partially updating an existing user's `name`, `lastName`, `email`, `phone`, `indicativeCountry`, or `role`. If `email` is updated, it MUST remain unique across all users.

#### Scenario: Successful partial update
- **WHEN** a client sends `PATCH /users/:id` with one or more updatable fields for an existing user
- **THEN** the system updates only the provided fields and returns the updated user

#### Scenario: Update to a duplicate email rejected
- **WHEN** a client sends `PATCH /users/:id` with an `email` that already belongs to a different existing user
- **THEN** the system rejects the request and leaves the user unchanged

#### Scenario: Update of non-existent user
- **WHEN** a client sends `PATCH /users/:id` with an `id` that does not match any existing user
- **THEN** the system responds with a not-found error

### Requirement: Delete User
The system SHALL allow deleting an existing user by `id`. Deleting a user MUST remove them from the `assignees` of any task they were assigned to, without deleting those tasks.

#### Scenario: Successful deletion
- **WHEN** a client sends `DELETE /users/:id` with the `id` of an existing user
- **THEN** the system deletes the user and the user no longer appears in any task's `assignees`

#### Scenario: Deletion of non-existent user
- **WHEN** a client sends `DELETE /users/:id` with an `id` that does not match any existing user
- **THEN** the system responds with a not-found error
