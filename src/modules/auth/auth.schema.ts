import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3).max(30),

  email: z.email(),

  password: z.string().min(6),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.uuid(),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

export const logoutSchema = z.object({
  refreshToken: z.uuid(),
});

export type LogoutInput = z.infer<typeof logoutSchema>;
