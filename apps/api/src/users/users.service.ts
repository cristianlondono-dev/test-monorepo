import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { User } from "./user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  async create(dto: CreateUserDto): Promise<User> {
    await this.ensureEmailIsAvailable(dto.email);
    const user = this.usersRepository.create(dto);
    return this.usersRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  async findByIds(ids: string[]): Promise<User[]> {
    const users = await this.usersRepository.find({ where: { id: In(ids) } });
    if (users.length !== ids.length) {
      const foundIds = new Set(users.map((user) => user.id));
      const missing = ids.filter((id) => !foundIds.has(id));
      throw new NotFoundException(`User(s) not found: ${missing.join(", ")}`);
    }
    return users;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (dto.email && dto.email !== user.email) {
      await this.ensureEmailIsAvailable(dto.email);
    }
    Object.assign(user, dto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    // The tasks_assignees join table FK on usersId has no cascade delete
    // (TypeORM only cascades the owning/Task side), so it must be cleared explicitly.
    await this.usersRepository.manager
      .createQueryBuilder()
      .delete()
      .from("tasks_assignees")
      .where("usersId = :id", { id })
      .execute();
    await this.usersRepository.remove(user);
  }

  private async ensureEmailIsAvailable(email: string): Promise<void> {
    const existing = await this.usersRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException(`Email ${email} is already in use`);
    }
  }
}
