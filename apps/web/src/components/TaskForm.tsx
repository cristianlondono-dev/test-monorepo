"use client";

import { useState, type FormEvent } from "react";
import type { CreateTaskDto, Task, User } from "@repo/types";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";
const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

interface TaskFormProps {
  task?: Task;
  users: User[];
  onSubmit: (dto: CreateTaskDto) => Promise<void>;
}

export function TaskForm({ task, users, onSubmit }: TaskFormProps) {
  const [name, setName] = useState(task?.name ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [dueDate, setDueDate] = useState(task ? toDateInputValue(task.dueDate) : "");
  const [assigneeIds, setAssigneeIds] = useState<string[]>(
    task?.assignees.map((assignee) => assignee.id) ?? [],
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleAssignee(id: string) {
    setAssigneeIds((prev) =>
      prev.includes(id) ? prev.filter((assigneeId) => assigneeId !== id) : [...prev, id],
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (assigneeIds.length === 0) {
      setError("Selecciona al menos un responsable");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ name, description, dueDate: new Date(dueDate).toISOString(), assigneeIds });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la tarea");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <label className="flex flex-col gap-1">
        <span className={labelClass}>Nombre</span>
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className={labelClass}>Descripción</span>
        <textarea
          className={inputClass}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className={labelClass}>Fecha de cierre</span>
        <input
          type="date"
          className={inputClass}
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
      </label>

      <div className="flex flex-col gap-1">
        <span className={labelClass}>Responsables</span>
        <div className="flex max-h-48 flex-col gap-2 overflow-y-auto rounded-md border border-zinc-300 p-3 dark:border-zinc-700">
          {users.map((user) => (
            <label key={user.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={assigneeIds.includes(user.id)}
                onChange={() => toggleAssignee(user.id)}
              />
              {user.name} {user.lastName}
            </label>
          ))}
          {users.length === 0 && (
            <p className="text-sm text-zinc-500">No hay usuarios disponibles.</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950"
      >
        {submitting ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
