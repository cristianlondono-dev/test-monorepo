import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UsersService } from "../users/users.service";
import { Task } from "./task.entity";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly tasksRepository: Repository<Task>,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateTaskDto): Promise<Task> {
    const assignees = await this.usersService.findByIds(dto.assigneeIds);
    const task = this.tasksRepository.create({
      name: dto.name,
      description: dto.description,
      dueDate: new Date(dto.dueDate),
      assignees,
    });
    return this.tasksRepository.save(task);
  }

  findAll(): Promise<Task[]> {
    return this.tasksRepository.find({ relations: ["assignees"] });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({ where: { id }, relations: ["assignees"] });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    if (dto.assigneeIds) {
      task.assignees = await this.usersService.findByIds(dto.assigneeIds);
    }
    if (dto.name !== undefined) {
      task.name = dto.name;
    }
    if (dto.description !== undefined) {
      task.description = dto.description;
    }
    if (dto.dueDate !== undefined) {
      task.dueDate = new Date(dto.dueDate);
    }
    if (dto.status !== undefined) {
      task.status = dto.status;
    }

    return this.tasksRepository.save(task);
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.tasksRepository.remove(task);
  }
}
