import { beforeEach, describe, expect, it, mock } from "bun:test";
import { createResponse } from "../helpers/http.ts";

const register = mock(async () => ({
  id: "user-1",
  username: "venom",
  email: "venom@example.com",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
}));

const login = mock(async () => ({
  id: "user-1",
  accessToken: "access-token",
}));

const me = mock(async () => ({
  id: "user-1",
  username: "venom",
  email: "venom@example.com",
}));

mock.module("../../src/modules/auth/auth.service.ts", () => ({
  authService: { register, login, me },
}));

const { authController } = await import(
  "../../src/modules/auth/auth.controller.ts"
);

describe("auth endpoints", () => {
  beforeEach(() => {
    register.mockClear();
    login.mockClear();
    me.mockClear();
  });

  it("POST /auth/register returns the registered user", async () => {
    const response = createResponse();

    await authController.register(
      {
        body: {
          username: "venom",
          email: "venom@example.com",
          password: "secret1",
        },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.body).toMatchObject({
      success: true,
      data: { email: "venom@example.com" },
    });
    expect(register).toHaveBeenCalledWith({
      username: "venom",
      email: "venom@example.com",
      password: "secret1",
    });
  });

  it("POST /auth/login returns an access token", async () => {
    const response = createResponse();

    await authController.login(
      {
        body: {
          email: "venom@example.com",
          password: "secret1",
        },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.body).toEqual({
      success: true,
      data: {
        id: "user-1",
        accessToken: "access-token",
      },
    });
    expect(login).toHaveBeenCalledWith({
      email: "venom@example.com",
      password: "secret1",
    });
  });

  it("GET /auth/me returns the authenticated user", async () => {
    const response = createResponse();

    await authController.me(
      {
        user: { userId: "user-1" },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        id: "user-1",
        username: "venom",
        email: "venom@example.com",
      },
    });
    expect(me).toHaveBeenCalledWith("user-1");
  });
});
