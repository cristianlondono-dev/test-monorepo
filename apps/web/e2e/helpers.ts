import type { CreateTaskDto, CreateUserDto, Task, User } from "@repo/types";

const API_URL = process.env.E2E_API_URL ?? "http://localhost:4000";

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

export async function createTestUser(dto: CreateUserDto): Promise<User> {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    throw new Error(`Failed to seed user: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function createTestTask(dto: CreateTaskDto): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    throw new Error(`Failed to seed task: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

// Best-effort: the UI flow under test may have already deleted the resource.
export async function deleteTestUser(id: string): Promise<void> {
  await fetch(`${API_URL}/users/${id}`, { method: "DELETE" }).catch(() => undefined);
}

export async function deleteTestTask(id: string): Promise<void> {
  await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" }).catch(() => undefined);
}

// For resources created through the UI (no id available to the test directly):
// look them up by a unique field and delete if still present. No-ops if already
// removed by the UI flow itself.
export async function deleteUserByEmail(email: string): Promise<void> {
  const res = await fetch(`${API_URL}/users`).catch(() => undefined);
  if (!res?.ok) return;
  const users: User[] = await res.json();
  const match = users.find((user) => user.email === email);
  if (match) {
    await deleteTestUser(match.id);
  }
}

export async function deleteTaskByName(name: string): Promise<void> {
  const res = await fetch(`${API_URL}/tasks`).catch(() => undefined);
  if (!res?.ok) return;
  const tasks: Task[] = await res.json();
  const match = tasks.find((task) => task.name === name);
  if (match) {
    await deleteTestTask(match.id);
  }
}
