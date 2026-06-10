import type { Request, Response } from "express";
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  type LoginInput,
  type RefreshTokenInput,
  type RegisterInput,
} from "./auth.schema.ts";
import { authService } from "./auth.service.ts";

export class AuthController {
  async register(req: Request, res: Response) {
    const data: RegisterInput = registerSchema.parse(req.body);

    const user = await authService.register(data);

    return res.status(201).json({
      success: true,
      data: user,
    });
  }

  async login(req: Request, res: Response) {
    const data: LoginInput = loginSchema.parse(req.body);

    const user = await authService.login(data);

    return res.status(201).json({
      success: true,
      data: user,
    });
  }

  async me(req: Request, res: Response) {
    const user = await authService.me(req.user!.userId);

    return res.status(200).json({
      success: true,
      data: user,
    });
  }

  async refreshToken(req: Request, res: Response) {
    const { refreshToken }: RefreshTokenInput =
      refreshTokenSchema.parse(req.body);

    const token = await authService.refreshAccessToken(refreshToken);

    return res.status(200).json({
      success: true,
      data: token,
    });
  }
}

export const authController = new AuthController();
