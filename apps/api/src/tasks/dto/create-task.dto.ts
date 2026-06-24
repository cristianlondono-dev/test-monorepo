import { ArrayMinSize, IsDateString, IsNotEmpty, IsString, IsUUID } from "class-validator";
import type { CreateTaskDto as CreateTaskDtoType } from "@repo/types";

export class CreateTaskDto implements CreateTaskDtoType {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  dueDate: string;

  @IsUUID(undefined, { each: true })
  @ArrayMinSize(1)
  assigneeIds: string[];
}
