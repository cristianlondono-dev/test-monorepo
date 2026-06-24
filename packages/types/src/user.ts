export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  MEMBER = "member",
}

export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  indicativeCountry: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type CreateUserDto = Pick<
  User,
  "name" | "lastName" | "email" | "phone" | "indicativeCountry" | "role"
>;

export type UpdateUserDto = Partial<CreateUserDto>;
