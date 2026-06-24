import { PartialType, ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { TaskStatus } from "@repo/types";
import { CreateTaskDto } from "./create-task.dto";

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiProperty({
    description: "Completion status",
    enum: TaskStatus,
    example: TaskStatus.COMPLETED,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
