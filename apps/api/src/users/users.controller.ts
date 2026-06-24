import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ErrorResponseDto } from "../common/dto/error-response.dto";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: "Create a user", description: "Creates a new user. The email must be unique." })
  @ApiResponse({ status: 201, description: "User created" })
  @ApiResponse({ status: 400, description: "Validation failed", type: ErrorResponseDto })
  @ApiResponse({ status: 409, description: "Email already in use", type: ErrorResponseDto })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "List users", description: "Returns every user." })
  @ApiResponse({ status: 200, description: "List of users" })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a user by id" })
  @ApiResponse({ status: 200, description: "User found" })
  @ApiResponse({ status: 404, description: "User not found", type: ErrorResponseDto })
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({
    summary: "Update a user",
    description: "Partially updates a user. If email is changed, it must remain unique.",
  })
  @ApiResponse({ status: 200, description: "User updated" })
  @ApiResponse({ status: 400, description: "Validation failed", type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: "User not found", type: ErrorResponseDto })
  @ApiResponse({ status: 409, description: "Email already in use", type: ErrorResponseDto })
  update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({
    summary: "Delete a user",
    description: "Deletes a user and removes them from any task's assignees.",
  })
  @ApiResponse({ status: 200, description: "User deleted" })
  @ApiResponse({ status: 404, description: "User not found", type: ErrorResponseDto })
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }
}
