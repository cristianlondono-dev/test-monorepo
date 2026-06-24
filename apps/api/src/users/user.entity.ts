import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserRole } from "@repo/types";
import { Task } from "../tasks/task.entity";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ name: "last_name" })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column({ name: "indicative_country" })
  indicativeCountry: string;

  @Column({ type: "enum", enum: UserRole })
  role: UserRole;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @ManyToMany(() => Task, (task) => task.assignees)
  assignedTasks: Task[];
}
