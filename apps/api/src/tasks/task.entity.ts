import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { TaskStatus } from "@repo/types";
import { User } from "../users/user.entity";

@Entity({ name: "tasks" })
export class Task {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @Column({ name: "due_date", type: "timestamptz" })
  dueDate: Date;

  @Column({ type: "enum", enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @ManyToMany(() => User, (user) => user.assignedTasks)
  @JoinTable({ name: "tasks_assignees" })
  assignees: User[];
}
