import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { UserRole } from "@repo/types";
import type { CreateUserDto as CreateUserDtoType } from "@repo/types";

export class CreateUserDto implements CreateUserDtoType {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  indicativeCountry: string;

  @IsEnum(UserRole)
  role: UserRole;
}
