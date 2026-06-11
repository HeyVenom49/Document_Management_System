import argon2 from "argon2";
import { BadRequest } from "../../common/errors/bad-request.error.ts";
import { NotFound } from "../../common/errors/not-found.error.ts";
import { Unauthorized } from "../../common/errors/unauthorized.error.ts";
import { generateAccessToken } from "../../common/utils/jwt.ts";
import { userRepository } from "../users/user.repository.ts";
import type { LoginInput, RegisterInput } from "./auth.schema.ts";
import { refreshTokenRepository } from "./refresh-token.repository.ts";

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new BadRequest("Email already exists");
    }

    const passwordHash = await argon2.hash(data.password);

    const user = await userRepository.create({
      username: data.username,
      email: data.email,
      passwordHash,
    });

    return {
      id: user?.id,
      username: user?.username,
      email: user?.email,
      createdAt: user?.created_at,
    };
  }

  async login(data: LoginInput) {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new Unauthorized("Email or Password might be wrong");
    }
    const isPasswordCorrect = await argon2.verify(
      user.password_hash,
      data.password,
    );

    if (!isPasswordCorrect) {
      throw new Unauthorized("Email or Password might be wrong");
    }

    const accessToken = generateAccessToken({
      userId: user.id,
    });

    const refreshToken = await refreshTokenRepository.create(
      user.id,
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    );

    return {
      id: user.id,
      accessToken,
      refreshToken,
    };
  }

  async me(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFound("User not found");
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const storedToken = await refreshTokenRepository.findByToken(refreshToken);

    if (!storedToken) throw new Unauthorized("Invalid refresh token");

    if (storedToken.expireAt < new Date())
      throw new Unauthorized("Refresh token expired");

    const user = await userRepository.findById(storedToken.userId);

    if (!user) throw new NotFound("Couldn't find the user");

    await refreshTokenRepository.deleteByToken(refreshToken);

    const newRefreshToken = await refreshTokenRepository.create(
      user.id,
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    );

    const accessToken = generateAccessToken({
      userId: user.id,
    });

    return { accessToken, newRefreshToken };
  }

  async logout(refreshToken: string) {
    const token = await refreshTokenRepository.findByToken(refreshToken);

    if (!token) throw new Unauthorized("Invalid refresh token");

    await refreshTokenRepository.deleteByToken(refreshToken);

    return { message: "Logged out successfully" };
  }
}
export const authService = new AuthService();
