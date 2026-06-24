import type {
  CreateTaskDto,
  CreateUserDto,
  HealthStatus,
  Task,
  UpdateTaskDto,
  UpdateUserDto,
  User,
} from "@repo/types";

// Server-side calls (Server Components) run inside the `web` container and must reach
// `api` via the Docker network, not the host-published `localhost` URL the browser uses.
const API_URL =
  (typeof window === "undefined" ? process.env.API_INTERNAL_URL : undefined) ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

export async function parseApiError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (Array.isArray(body?.message)) {
      return body.message.join(", ");
    }
    if (typeof body?.message === "string") {
      return body.message;
    }
  } catch {
    // response had no JSON body
  }
  return `Request failed with status ${res.status}`;
}

export async function getApiHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`API health check failed with status ${res.status}`);
  }
  return res.json() as Promise<HealthStatus>;
}

export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_URL}/users`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  return res.json() as Promise<User[]>;
}

export async function createUser(dto: CreateUserDto): Promise<User> {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  return res.json() as Promise<User>;
}

export async function updateUser(id: string, dto: UpdateUserDto): Promise<User> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  return res.json() as Promise<User>;
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/users/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
}

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${API_URL}/tasks`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  return res.json() as Promise<Task[]>;
}

export async function createTask(dto: CreateTaskDto): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  return res.json() as Promise<Task>;
}

export async function updateTask(id: string, dto: UpdateTaskDto): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  return res.json() as Promise<Task>;
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
}
