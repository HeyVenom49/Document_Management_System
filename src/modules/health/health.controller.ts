import type { Request, Response } from "express";
import { checkDatabaseHealth } from "../../database/index.ts";
import { sendSuccess } from "../../common/http/response.ts";

export class HealthController {
  async liveness(_req: Request, res: Response) {
    return sendSuccess(res, {
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  }

  async readiness(_req: Request, res: Response) {
    const databaseHealthy = await checkDatabaseHealth();

    if (!databaseHealthy) {
      return res.status(503).json({
        success: false,
        message: "Service unavailable",
        data: {
          status: "degraded",
          checks: { database: "down" },
        },
      });
    }

    return sendSuccess(res, {
      status: "ready",
      checks: { database: "up" },
      timestamp: new Date().toISOString(),
    });
  }
}

export const healthController = new HealthController();
