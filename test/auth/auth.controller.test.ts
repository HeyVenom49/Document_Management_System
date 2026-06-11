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
  refreshToken: "550e8400-e29b-41d4-a716-446655440000",
}));

const me = mock(async () => ({
  id: "user-1",
  username: "venom",
  email: "venom@example.com",
}));

const refreshAccessToken = mock(async () => ({
  accessToken: "new-access-token",
  newRefreshToken: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
}));

const logout = mock(async () => ({
  message: "Logged out successfully",
}));

mock.module("../../src/modules/auth/auth.service.ts", () => ({
  authService: { register, login, me, refreshAccessToken, logout },
}));

const { authController } = await import(
  "../../src/modules/auth/auth.controller.ts"
);

describe("auth endpoints", () => {
  beforeEach(() => {
    register.mockClear();
    login.mockClear();
    me.mockClear();
    refreshAccessToken.mockClear();
    logout.mockClear();
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

  it("POST /auth/login returns access and refresh tokens", async () => {
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
        refreshToken: "550e8400-e29b-41d4-a716-446655440000",
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

  it("POST /auth/refresh returns a new access token and refresh token", async () => {
    const response = createResponse();

    await authController.refreshToken(
      {
        body: {
          refreshToken: "550e8400-e29b-41d4-a716-446655440000",
        },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        accessToken: "new-access-token",
        newRefreshToken: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      },
    });
    expect(refreshAccessToken).toHaveBeenCalledWith(
      "550e8400-e29b-41d4-a716-446655440000",
    );
  });

  it("POST /auth/logout revokes the refresh token", async () => {
    const response = createResponse();

    await authController.logout(
      {
        body: {
          refreshToken: "550e8400-e29b-41d4-a716-446655440000",
        },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.body).toEqual({
      success: true,
      message: "Logged out successfully",
    });
    expect(logout).toHaveBeenCalledWith(
      "550e8400-e29b-41d4-a716-446655440000",
    );
  });
});
