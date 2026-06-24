## ADDED Requirements

### Requirement: Tasks list
The `/tasks` page SHALL display every task, showing at least `name`, `description`, `dueDate`, its `assignees`, and a checkbox reflecting `status`. Each task MUST have an edit button and a delete button (trash icon).

#### Scenario: Tasks list renders
- **WHEN** a client opens `/tasks`
- **THEN** the page fetches all tasks from the API and renders each one with its name, description, due date, assignee names, a status checkbox, an edit button, and a delete button

#### Scenario: No tasks yet
- **WHEN** a client opens `/tasks` and the API returns an empty list
- **THEN** the page renders with no task rows instead of erroring

### Requirement: Create and assign a task via drawer
The `/tasks` page SHALL have a visible action to open the drawer in create mode, with a form for `name`, `description`, `dueDate`, and a checklist to select one or more existing users as assignees.

#### Scenario: Successful creation with assignees
- **WHEN** a client opens the create drawer, fills `name`, `description`, and `dueDate`, selects one or more users as assignees, and submits
- **THEN** the system creates the task via the API, closes the drawer, and the new task appears in the list with its assignees

#### Scenario: Submitting without an assignee is blocked
- **WHEN** a client tries to submit the create form without selecting any assignee
- **THEN** the form does not submit and indicates that at least one assignee is required

### Requirement: Edit task via drawer
Each task's edit button SHALL open the drawer in edit mode, pre-filled with that task's current `name`, `description`, `dueDate`, and `assignees`, allowing any of them to be changed and saved.

#### Scenario: Successful edit
- **WHEN** a client opens the edit drawer for a task, changes one or more fields (including adding/removing assignees), and submits
- **THEN** the system updates that task via the API, closes the drawer, and the list reflects the updated data

#### Scenario: Removing all assignees is blocked
- **WHEN** a client unchecks every assignee on the edit form and tries to submit
- **THEN** the form does not submit and indicates that at least one assignee is required

### Requirement: Toggle task completion status
Each task's checkbox SHALL toggle its `status` between `pending` and `completed` immediately on change, without opening the drawer.

#### Scenario: Mark as completed
- **WHEN** a client checks the checkbox for a task whose current status is `pending`
- **THEN** the system updates that task's `status` to `completed` via the API and the checkbox reflects the checked state

#### Scenario: Mark as not completed
- **WHEN** a client unchecks the checkbox for a task whose current status is `completed`
- **THEN** the system updates that task's `status` back to `pending` via the API and the checkbox reflects the unchecked state

### Requirement: Delete task
Each task's delete button SHALL remove that task after the API confirms the deletion.

#### Scenario: Successful deletion
- **WHEN** a client clicks the delete button for a task
- **THEN** the system deletes that task via the API and it no longer appears in the list
