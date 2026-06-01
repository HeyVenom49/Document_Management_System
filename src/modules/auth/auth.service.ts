import argon2 from "argon2";
import { userRepository } from "../users/user.repository.ts";
import type { RegisterInput } from "./auth.schema.ts";

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
}
export const authService = new AuthService();
