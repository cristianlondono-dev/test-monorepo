import type { User } from "./user.js";

export enum TaskStatus {
  PENDING = "pending",
  COMPLETED = "completed",
}

export interface Task {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  dueDate: string;
  status: TaskStatus;
  assignees: User[];
}

export interface CreateTaskDto {
  name: string;
  description: string;
  dueDate: string;
  assigneeIds: string[];
}

export type UpdateTaskDto = Partial<CreateTaskDto> & {
  status?: TaskStatus;
};
