"use client";

import { useState } from "react";
import { TaskStatus, type CreateTaskDto, type Task, type User } from "@repo/types";
import { useTaskActions } from "../hooks/useTaskActions";
import { Drawer } from "./Drawer";
import { TaskForm } from "./TaskForm";
import { TrashIcon } from "./TrashIcon";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

interface TasksViewProps {
  tasks: Task[];
  users: User[];
}

export function TasksView({ tasks, users }: TasksViewProps) {
  const { saveTask, removeTask, toggleTaskStatus } = useTaskActions();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  function openCreate() {
    setEditingTask(null);
    setDrawerOpen(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setDrawerOpen(true);
  }

  async function handleSubmit(dto: CreateTaskDto) {
    await saveTask(dto, editingTask?.id);
    setDrawerOpen(false);
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">Tareas</h1>
        <button
          onClick={openCreate}
          className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-950"
        >
          Nueva tarea
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">No hay tareas todavía.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-start gap-3 rounded-md border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <input
                type="checkbox"
                className="mt-1"
                checked={task.status === TaskStatus.COMPLETED}
                onChange={() => toggleTaskStatus(task)}
                aria-label="Marcar como completada"
              />
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    task.status === TaskStatus.COMPLETED
                      ? "text-zinc-400 line-through dark:text-zinc-600"
                      : "text-zinc-950 dark:text-zinc-50"
                  }`}
                >
                  {task.name}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{task.description}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Vence: {formatDate(task.dueDate)} · Responsables:{" "}
                  {task.assignees.map((assignee) => `${assignee.name} ${assignee.lastName}`).join(", ")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openEdit(task)}
                  className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
                >
                  Editar
                </button>
                <button
                  onClick={() => removeTask(task.id)}
                  aria-label="Eliminar"
                  className="text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
                >
                  <TrashIcon />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingTask ? "Editar tarea" : "Nueva tarea"}
      >
        <TaskForm
          key={editingTask?.id ?? "create"}
          task={editingTask ?? undefined}
          users={users}
          onSubmit={handleSubmit}
        />
      </Drawer>
    </div>
  );
}
