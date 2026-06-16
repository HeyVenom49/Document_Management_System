import { beforeEach, describe, expect, it, mock } from "bun:test";
import { createResponse } from "../helpers/http.ts";

const checkDatabaseHealth = mock(async () => true);

mock.module("../../src/database/index.ts", () => ({
  checkDatabaseHealth,
}));

const { healthController } = await import(
  "../../src/modules/health/health.controller.ts"
);

describe("health endpoints", () => {
  beforeEach(() => {
    checkDatabaseHealth.mockClear();
    checkDatabaseHealth.mockImplementation(async () => true);
  });

  it("GET /health returns liveness status", async () => {
    const response = createResponse();

    await healthController.liveness({} as never, response as never);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { status: "ok" },
    });
  });

  it("GET /health/ready returns ready when database is healthy", async () => {
    const response = createResponse();

    await healthController.readiness({} as never, response as never);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        status: "ready",
        checks: { database: "up" },
      },
    });
    expect(checkDatabaseHealth).toHaveBeenCalled();
  });

  it("GET /health/ready returns 503 when database is down", async () => {
    checkDatabaseHealth.mockImplementation(async () => false);
    const response = createResponse();

    await healthController.readiness({} as never, response as never);

    expect(response.status).toHaveBeenCalledWith(503);
    expect(response.body).toMatchObject({
      success: false,
      data: {
        status: "degraded",
        checks: { database: "down" },
      },
    });
  });
});
