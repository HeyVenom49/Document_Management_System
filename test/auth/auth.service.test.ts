import { beforeEach, describe, expect, it, mock } from "bun:test";
import { NotFound } from "../../src/common/errors/not-found.error.ts";
import { Unauthorized } from "../../src/common/errors/unauthorized.error.ts";

const refreshToken = "550e8400-e29b-41d4-a716-446655440000";
const newRefreshToken = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

const findByToken = mock(async () => ({
  token: refreshToken,
  userId: "user-1",
  expireAt: new Date(Date.now() + 86_400_000),
}));

const deleteByToken = mock(async () => {});

const createRefreshToken = mock(async () => ({
  token: newRefreshToken,
  userId: "user-1",
}));

const findById = mock(async () => ({
  id: "user-1",
  username: "venom",
  email: "venom@example.com",
  password_hash: "hash",
}));

mock.module("../../src/modules/auth/refresh-token.repository.ts", () => ({
  refreshTokenRepository: {
    findByToken,
    deleteByToken,
    create: createRefreshToken,
  },
}));

mock.module("../../src/modules/users/user.repository.ts", () => ({
  userRepository: { findById },
}));

mock.module("../../src/common/utils/jwt.ts", () => ({
  generateAccessToken: mock(() => "new-access-token"),
}));

const { authService } = await import("../../src/modules/auth/auth.service.ts");

describe("auth service", () => {
  beforeEach(() => {
    findByToken.mockClear();
    deleteByToken.mockClear();
    createRefreshToken.mockClear();
    findById.mockClear();

    findByToken.mockImplementation(async () => ({
      token: refreshToken,
      userId: "user-1",
      expireAt: new Date(Date.now() + 86_400_000),
    }));

    findById.mockImplementation(async () => ({
      id: "user-1",
      username: "venom",
      email: "venom@example.com",
      password_hash: "hash",
    }));

    createRefreshToken.mockImplementation(async () => ({
      token: newRefreshToken,
      userId: "user-1",
    }));
  });

  it("refreshAccessToken rotates the refresh token and issues a new access token", async () => {
    const result = await authService.refreshAccessToken(refreshToken);

    expect(findByToken).toHaveBeenCalledWith(refreshToken);
    expect(deleteByToken).toHaveBeenCalledWith(refreshToken);
    expect(createRefreshToken).toHaveBeenCalled();
    expect(result).toEqual({
      accessToken: "new-access-token",
      newRefreshToken: {
        token: newRefreshToken,
        userId: "user-1",
      },
    });
  });

  it("refreshAccessToken throws Unauthorized when the refresh token is invalid", async () => {
    findByToken.mockImplementation(async () => null);

    await expect(authService.refreshAccessToken(refreshToken)).rejects.toThrow(
      Unauthorized,
    );
  });

  it("refreshAccessToken throws Unauthorized when the refresh token is expired", async () => {
    findByToken.mockImplementation(async () => ({
      token: refreshToken,
      userId: "user-1",
      expireAt: new Date(Date.now() - 86_400_000),
    }));

    await expect(authService.refreshAccessToken(refreshToken)).rejects.toThrow(
      Unauthorized,
    );
  });

  it("refreshAccessToken throws NotFound when the user no longer exists", async () => {
    findById.mockImplementation(async () => null);

    await expect(authService.refreshAccessToken(refreshToken)).rejects.toThrow(
      NotFound,
    );
  });

  it("logout deletes the refresh token", async () => {
    const result = await authService.logout(refreshToken);

    expect(findByToken).toHaveBeenCalledWith(refreshToken);
    expect(deleteByToken).toHaveBeenCalledWith(refreshToken);
    expect(result).toEqual({ message: "Logged out successfully" });
  });

  it("logout throws Unauthorized when the refresh token is invalid", async () => {
    findByToken.mockImplementation(async () => null);

    await expect(authService.logout(refreshToken)).rejects.toThrow(Unauthorized);
  });
});
