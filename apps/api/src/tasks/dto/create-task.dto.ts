import { ArrayMinSize, IsDateString, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import type { CreateTaskDto as CreateTaskDtoType } from "@repo/types";

export class CreateTaskDto implements CreateTaskDtoType {
  @ApiProperty({ description: "Short task name", example: "Write quarterly report" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: "Task description", example: "Summarize Q3 results for the board" })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: "Due date, ISO 8601",
    example: "2026-12-31T00:00:00.000Z",
  })
  @IsDateString()
  dueDate: string;

  @ApiProperty({
    description: "Ids of the users responsible for this task; at least one is required",
    example: ["3fa85f64-5717-4562-b3fc-2c963f66afa6"],
    type: [String],
  })
  @IsUUID(undefined, { each: true })
  @ArrayMinSize(1)
  assigneeIds: string[];
}
