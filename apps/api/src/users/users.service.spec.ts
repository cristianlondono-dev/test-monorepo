import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserRole } from "@repo/types";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { UsersService } from "./users.service";

describe("UsersService", () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  const baseUser: User = {
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  describe("create", () => {
    it("rejects a duplicate email", async () => {
      repository.findOne.mockResolvedValueOnce(baseUser);

      await expect(
        service.create({
          name: "Grace",
          lastName: "Hopper",
          email: baseUser.email,
          phone: "5551111",
          indicativeCountry: "+57",
          role: UserRole.MEMBER,
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it("creates a user when the email is available", async () => {
      repository.findOne.mockResolvedValueOnce(null);
      repository.create.mockReturnValueOnce(baseUser);
      repository.save.mockResolvedValueOnce(baseUser);

      const dto = {
        name: baseUser.name,
        lastName: baseUser.lastName,
        email: baseUser.email,
        phone: baseUser.phone,
        indicativeCountry: baseUser.indicativeCountry,
        role: baseUser.role,
      };
      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(baseUser);
    });
  });

  describe("findOne", () => {
    it("throws when the user does not exist", async () => {
      repository.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne("missing-id")).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe("findByIds", () => {
    it("throws listing the ids that could not be found", async () => {
      repository.find.mockResolvedValueOnce([baseUser]);

      await expect(service.findByIds([baseUser.id, "missing-id"])).rejects.toThrow(
        /missing-id/,
      );
    });

    it("returns all users when every id exists", async () => {
      repository.find.mockResolvedValueOnce([baseUser]);

      const result = await service.findByIds([baseUser.id]);

      expect(result).toEqual([baseUser]);
    });
  });
});
