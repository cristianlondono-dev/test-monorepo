import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { TaskStatus, UserRole } from "@repo/types";
import { Repository } from "typeorm";
import { User } from "../users/user.entity";
import { UsersService } from "../users/users.service";
import { Task } from "./task.entity";
import { TasksService } from "./tasks.service";

describe("TasksService", () => {
  let service: TasksService;
  let repository: jest.Mocked<Repository<Task>>;
  let usersService: jest.Mocked<UsersService>;

  const assignee: User = {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    phone: "5550000",
    indicativeCountry: "+57",
    role: UserRole.MEMBER,
    createdAt: new Date(),
    updatedAt: new Date(),
    assignedTasks: [],
  };

  const baseTask: Task = {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Write report",
    description: "Quarterly report",
    createdAt: new Date(),
    dueDate: new Date(),
    status: TaskStatus.PENDING,
    assignees: [assignee],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByIds: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(TasksService);
    repository = module.get(getRepositoryToken(Task));
    usersService = module.get(UsersService);
  });

  describe("create", () => {
    it("resolves assignees before creating the task", async () => {
      usersService.findByIds.mockResolvedValueOnce([assignee]);
      repository.create.mockReturnValueOnce(baseTask);
      repository.save.mockResolvedValueOnce(baseTask);

      const result = await service.create({
        name: baseTask.name,
        description: baseTask.description,
        dueDate: baseTask.dueDate.toISOString(),
        assigneeIds: [assignee.id],
      });

      expect(usersService.findByIds).toHaveBeenCalledWith([assignee.id]);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ assignees: [assignee] }),
      );
      expect(result).toBe(baseTask);
    });
  });

  describe("update", () => {
    it("re-resolves assignees when assigneeIds is provided", async () => {
      repository.findOne.mockResolvedValueOnce(baseTask);
      usersService.findByIds.mockResolvedValueOnce([assignee]);
      repository.save.mockResolvedValueOnce(baseTask);

      await service.update(baseTask.id, { assigneeIds: [assignee.id] });

      expect(usersService.findByIds).toHaveBeenCalledWith([assignee.id]);
      expect(repository.save).toHaveBeenCalled();
    });

    it("does not touch assignees when assigneeIds is omitted", async () => {
      repository.findOne.mockResolvedValueOnce(baseTask);
      repository.save.mockResolvedValueOnce(baseTask);

      await service.update(baseTask.id, { status: TaskStatus.COMPLETED });

      expect(usersService.findByIds).not.toHaveBeenCalled();
    });
  });
});
