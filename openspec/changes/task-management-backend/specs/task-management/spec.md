## ADDED Requirements

### Requirement: Create Task
The system SHALL allow creating a `Task` with `name`, `description`, `dueDate`, and one or more `assigneeIds` referencing existing users. `createdAt` MUST be set automatically by the system. `status` MUST default to `pending` on creation. At least one assignee is required.

#### Scenario: Successful creation
- **WHEN** a client sends `POST /tasks` with `name`, `description`, `dueDate`, and a non-empty `assigneeIds` array of existing user ids
- **THEN** the system creates the task with `status` set to `pending`, `createdAt` set to the current time, and returns it with the resolved `assignees`

#### Scenario: Missing required field rejected
- **WHEN** a client sends `POST /tasks` without one of `name`, `description`, `dueDate`, or `assigneeIds`
- **THEN** the system rejects the request and does not create a task

#### Scenario: Empty assignees rejected
- **WHEN** a client sends `POST /tasks` with an empty `assigneeIds` array
- **THEN** the system rejects the request and does not create a task

#### Scenario: Unknown assignee rejected
- **WHEN** a client sends `POST /tasks` with an `assigneeIds` value that does not match any existing user
- **THEN** the system rejects the request and does not create a task

### Requirement: List Tasks
The system SHALL allow retrieving the full list of tasks, including each task's assignees.

#### Scenario: List returns all tasks with assignees
- **WHEN** a client sends `GET /tasks`
- **THEN** the system returns an array containing every existing task, each including its `assignees`

### Requirement: Retrieve Task by id
The system SHALL allow retrieving a single task by its `id`, including its assignees.

#### Scenario: Task found
- **WHEN** a client sends `GET /tasks/:id` with the `id` of an existing task
- **THEN** the system returns that task's data including its `assignees`

#### Scenario: Task not found
- **WHEN** a client sends `GET /tasks/:id` with an `id` that does not match any existing task
- **THEN** the system responds with a not-found error

### Requirement: Update Task
The system SHALL allow partially updating an existing task's `name`, `description`, `dueDate`, `assigneeIds`, or `status`. A task MUST always retain at least one assignee.

#### Scenario: Successful partial update
- **WHEN** a client sends `PATCH /tasks/:id` with one or more updatable fields for an existing task
- **THEN** the system updates only the provided fields and returns the updated task

#### Scenario: Update of non-existent task
- **WHEN** a client sends `PATCH /tasks/:id` with an `id` that does not match any existing task
- **THEN** the system responds with a not-found error

#### Scenario: Removing all assignees rejected
- **WHEN** a client sends `PATCH /tasks/:id` with an empty `assigneeIds` array
- **THEN** the system rejects the request and leaves the task's assignees unchanged

#### Scenario: Unknown assignee rejected on update
- **WHEN** a client sends `PATCH /tasks/:id` with an `assigneeIds` value that does not match any existing user
- **THEN** the system rejects the request and leaves the task unchanged

### Requirement: Toggle Task completion status
The system SHALL allow marking a task as completed or marking it back as not completed by updating its `status` between `completed` and `pending` through the task update endpoint.

#### Scenario: Mark task as completed
- **WHEN** a client sends `PATCH /tasks/:id` with `status` set to `completed` for a task whose current status is `pending`
- **THEN** the system updates the task's `status` to `completed`

#### Scenario: Mark task as not completed
- **WHEN** a client sends `PATCH /tasks/:id` with `status` set to `pending` for a task whose current status is `completed`
- **THEN** the system updates the task's `status` back to `pending`

### Requirement: Delete Task
The system SHALL allow deleting an existing task by `id`.

#### Scenario: Successful deletion
- **WHEN** a client sends `DELETE /tasks/:id` with the `id` of an existing task
- **THEN** the system deletes the task and it no longer appears in the task list

#### Scenario: Deletion of non-existent task
- **WHEN** a client sends `DELETE /tasks/:id` with an `id` that does not match any existing task
- **THEN** the system responds with a not-found error
