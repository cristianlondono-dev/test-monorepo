export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export type CreateUserDto = Pick<User, "email" | "name">;
