## 1. API client

- [x] 1.1 Add `parseApiError(res: Response): Promise<string>` to `apps/web/src/lib/api.ts`, reading the NestJS error body (`message: string | string[]`) and returning a single display string
- [x] 1.2 Add `getUsers`, `createUser(dto: CreateUserDto)`, `updateUser(id, dto: UpdateUserDto)`, `deleteUser(id)` to `src/lib/api.ts`, typed with `@repo/types`
- [x] 1.3 Add `getTasks`, `createTask(dto: CreateTaskDto)`, `updateTask(id, dto: UpdateTaskDto)`, `deleteTask(id)` to `src/lib/api.ts`, typed with `@repo/types`

## 2. Shared components

- [x] 2.1 Create `apps/web/src/components/Drawer.tsx`: controlled `{ open, onClose, title, children }` slide-in panel with backdrop click and `Escape`-to-close
- [x] 2.2 Create `apps/web/src/components/TrashIcon.tsx`: small inline SVG icon used by the delete buttons on both pages

## 3. Users page

- [x] 3.1 Create `apps/web/src/hooks/useUserActions.ts`: business-logic layer exposing `saveUser(dto, userId?)` (create-vs-update) and `removeUser(id)`, each calling `lib/api.ts` and then `router.refresh()`
- [x] 3.2 Create `apps/web/src/components/UserForm.tsx`: purely presentational controlled form for `name`, `lastName`, `email`, `phone`, `indicativeCountry`, `role` (select), calling an `onSubmit(dto)` prop (no direct API calls), surfacing thrown error messages inline
- [x] 3.3 Create `apps/web/src/app/users/page.tsx` (Server Component, fetches `getUsers()`) and `apps/web/src/components/UsersView.tsx` (Client Component): render the users table (`name`, `lastName`, `email`, `phone`, `indicativeCountry`, `role`, edit button, delete button), owning only drawer/editing-row UI state and delegating mutations to `useUserActions`
- [x] 3.4 Wire a "Nuevo usuario" button that opens `Drawer` + `UserForm` in create mode; `onSubmit` calls `saveUser(dto)` then closes the drawer
- [x] 3.5 Wire each row's edit button to open `Drawer` + `UserForm` pre-filled in edit mode; `onSubmit` calls `saveUser(dto, user.id)` then closes the drawer
- [x] 3.6 Wire each row's delete button (using `TrashIcon`) to call `removeUser`

## 4. Tasks page

- [x] 4.1 Create `apps/web/src/hooks/useTaskActions.ts`: business-logic layer exposing `saveTask(dto, taskId?)`, `removeTask(id)`, and `toggleTaskStatus(task)`, each calling `lib/api.ts` and then `router.refresh()`
- [x] 4.2 Create `apps/web/src/components/TaskForm.tsx`: purely presentational controlled form for `name`, `description`, `dueDate`, and a checklist of all users (received via a `users` prop) to pick one or more `assigneeIds`, calling an `onSubmit(dto)` prop, blocking submit when no assignee is selected
- [x] 4.3 Create `apps/web/src/app/tasks/page.tsx` (Server Component, fetches `getTasks()` + `getUsers()`) and `apps/web/src/components/TasksView.tsx` (Client Component): render the tasks list (`name`, `description`, formatted `dueDate`, assignee names joined, status checkbox, edit button, delete button), delegating mutations to `useTaskActions`
- [x] 4.4 Wire a "Nueva tarea" button that opens `Drawer` + `TaskForm` in create mode; `onSubmit` calls `saveTask(dto)` then closes the drawer
- [x] 4.5 Wire each task's edit button to open `Drawer` + `TaskForm` pre-filled in edit mode (existing `assigneeIds` pre-checked); `onSubmit` calls `saveTask(dto, task.id)` then closes the drawer
- [x] 4.6 Wire each task's status checkbox `onChange` to call `toggleTaskStatus(task)`
- [x] 4.7 Wire each task's delete button (using `TrashIcon`) to call `removeTask`

## 5. Navigation

- [x] 5.1 Add a minimal nav ("Tareas" / "Usuarios") to `apps/web/src/app/layout.tsx`
- [x] 5.2 Replace `apps/web/src/app/page.tsx` with a `redirect("/tasks")` (from `next/navigation`)

## 6. Verification

- [x] 6.1 Start the local stack (`docker compose up -d --build web` against the running `api`+`db` containers — `pnpm dev` was not usable for this check since `apps/api`/`apps/web` running on the host can't resolve the `db`/`api` Docker-network hostnames; verified via the containerized stack instead)
- [x] 6.2 Exercise the full Users flow against the real API + SSR pages: create, delete, and confirm the table re-renders correctly (drawer/edit click-path reviewed in code, not exercised via a real browser — no browser-automation tool available in this environment)
- [x] 6.3 Exercise the full Tasks flow against the real API + SSR pages: create with multiple assignees, toggle status both ways, delete, and confirm the list re-renders correctly each time (drawer/edit and the no-assignee submit guard reviewed in code, not exercised via a real browser)
- [x] 6.4 Run `pnpm --filter web lint` and `pnpm --filter web type-check`
