import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "@repo/types";
import type { CreateUserDto as CreateUserDtoType } from "@repo/types";

export class CreateUserDto implements CreateUserDtoType {
  @ApiProperty({ description: "Given name", example: "Ada" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: "Family name", example: "Lovelace" })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: "Unique email address",
    example: "ada@example.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "Phone number, without the country code", example: "5550001" })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: "Phone country code", example: "+57" })
  @IsString()
  @IsNotEmpty()
  indicativeCountry: string;

  @ApiProperty({ description: "Role within the organization", enum: UserRole, example: UserRole.MEMBER })
  @IsEnum(UserRole)
  role: UserRole;
}
