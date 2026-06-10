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
}
export const authService = new AuthService();
