import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { HealthStatus } from "@repo/types";
import { HealthService } from "./health.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: "Health check",
    description: "Reports API status and database connectivity. Never throws.",
  })
  @ApiResponse({ status: 200, description: "Health status" })
  check(): Promise<HealthStatus> {
    return this.healthService.check();
  }
}
