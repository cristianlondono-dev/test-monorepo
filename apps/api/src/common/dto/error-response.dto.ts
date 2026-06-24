import { ApiProperty } from "@nestjs/swagger";

export class ErrorResponseDto {
  @ApiProperty({ description: "HTTP status code", example: 400 })
  statusCode: number;

  @ApiProperty({
    description: "Human-readable error message(s). An array when multiple validation rules fail.",
    example: "email must be an email",
    oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
  })
  message: string | string[];

  @ApiProperty({ description: "Short error name for the status code", example: "Bad Request" })
  error: string;
}
