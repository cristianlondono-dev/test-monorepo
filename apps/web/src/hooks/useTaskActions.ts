"use client";

import { useRouter } from "next/navigation";
import { TaskStatus, type CreateTaskDto, type Task, type UpdateTaskDto } from "@repo/types";
import { createTask, deleteTask, updateTask } from "../lib/api";

export function useTaskActions() {
  const router = useRouter();

  async function saveTask(dto: CreateTaskDto | UpdateTaskDto, taskId?: string): Promise<void> {
    if (taskId) {
      await updateTask(taskId, dto);
    } else {
      await createTask(dto as CreateTaskDto);
    }
    router.refresh();
  }

  async function removeTask(id: string): Promise<void> {
    await deleteTask(id);
    router.refresh();
  }

  async function toggleTaskStatus(task: Task): Promise<void> {
    const status = task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;
    await updateTask(task.id, { status });
    router.refresh();
  }

  return { saveTask, removeTask, toggleTaskStatus };
}
