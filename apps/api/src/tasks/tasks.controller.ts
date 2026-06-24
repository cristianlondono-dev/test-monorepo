import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ErrorResponseDto } from "../common/dto/error-response.dto";
import { TasksService } from "./tasks.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";

@ApiTags("tasks")
@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({
    summary: "Create a task",
    description: "Creates a task assigned to one or more existing users.",
  })
  @ApiResponse({ status: 201, description: "Task created" })
  @ApiResponse({
    status: 400,
    description: "Validation failed (e.g. no assignees provided)",
    type: ErrorResponseDto,
  })
  @ApiResponse({ status: 404, description: "One or more assignee ids do not exist", type: ErrorResponseDto })
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "List tasks", description: "Returns every task, including its assignees." })
  @ApiResponse({ status: 200, description: "List of tasks" })
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a task by id" })
  @ApiResponse({ status: 200, description: "Task found" })
  @ApiResponse({ status: 404, description: "Task not found", type: ErrorResponseDto })
  findOne(@Param("id") id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({
    summary: "Update a task",
    description: "Partially updates a task, including reassigning it or toggling its status.",
  })
  @ApiResponse({ status: 200, description: "Task updated" })
  @ApiResponse({
    status: 400,
    description: "Validation failed (e.g. assignees emptied)",
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Task not found, or one or more assignee ids do not exist",
    type: ErrorResponseDto,
  })
  update(@Param("id") id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a task" })
  @ApiResponse({ status: 200, description: "Task deleted" })
  @ApiResponse({ status: 404, description: "Task not found", type: ErrorResponseDto })
  remove(@Param("id") id: string) {
    return this.tasksService.remove(id);
  }
}
