import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import type { HealthStatus } from "@repo/types";

@Injectable()
export class HealthService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async check(): Promise<HealthStatus> {
    let database: HealthStatus["database"];
    try {
      await this.dataSource.query("SELECT 1");
      database = "up";
    } catch {
      database = "down";
    }
    return {
      status: database === "up" ? "ok" : "error",
      database,
      timestamp: new Date().toISOString(),
    };
  }
}
