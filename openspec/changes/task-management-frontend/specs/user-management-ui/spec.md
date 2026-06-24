## ADDED Requirements

### Requirement: Users table
The `/users` page SHALL display every user in a table, showing at least `name`, `lastName`, `email`, `phone`, `indicativeCountry`, and `role`. Each row MUST have an edit button and a delete button (trash icon).

#### Scenario: Users list renders
- **WHEN** a client opens `/users`
- **THEN** the page fetches all users from the API and renders one table row per user with their data, an edit button, and a delete button

#### Scenario: No users yet
- **WHEN** a client opens `/users` and the API returns an empty list
- **THEN** the page renders the table with no rows instead of erroring

### Requirement: Create user via drawer
The `/users` page SHALL have a visible action to open the drawer in create mode, with an empty form for `name`, `lastName`, `email`, `phone`, `indicativeCountry`, and `role`.

#### Scenario: Successful creation
- **WHEN** a client opens the create drawer, fills in all fields with valid data, and submits
- **THEN** the system creates the user via the API, closes the drawer, and the new user appears in the table

#### Scenario: Duplicate email surfaced
- **WHEN** a client submits the create form with an `email` that already belongs to another user
- **THEN** the drawer stays open and shows the API's rejection message instead of closing

### Requirement: Edit user via drawer
Each row's edit button SHALL open the drawer in edit mode, pre-filled with that user's current data, allowing any field to be changed and saved.

#### Scenario: Successful edit
- **WHEN** a client opens the edit drawer for a user, changes one or more fields, and submits
- **THEN** the system updates that user via the API, closes the drawer, and the table reflects the updated data

#### Scenario: Edit validation error surfaced
- **WHEN** a client submits the edit form with an `email` that belongs to a different existing user
- **THEN** the drawer stays open and shows the API's rejection message instead of closing

### Requirement: Delete user
Each row's delete button SHALL remove that user after the API confirms the deletion.

#### Scenario: Successful deletion
- **WHEN** a client clicks the delete button for a user
- **THEN** the system deletes that user via the API and it no longer appears in the table
