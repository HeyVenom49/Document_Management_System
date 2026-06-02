import argon2 from "argon2";
import { userRepository } from "../users/user.repository.ts";
import type { LoginInput, RegisterInput } from "./auth.schema.ts";
import { generateAccessToken } from "../../common/utils/jwt.ts";

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new Error("Email already exists");
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
      throw new Error("Email or Password might be wrong");
    }
    const isPasswordCorrect = await argon2.verify(
      user.password_hash,
      data.password,
    );

    if (!isPasswordCorrect) {
      throw new Error("Email or Password might be wrong");
    }

    const accessToken = generateAccessToken({
      userId: user.id,
    });

    return {
      id: user.id,
      accessToken,
    };
  }

  async me(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }
}
export const authService = new AuthService();
