import type { Request, Response } from "express";
import { getUserId } from "../../common/http/request.ts";
import { sendCreated, sendMessage, sendSuccess } from "../../common/http/response.ts";
import {
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerSchema,
  type LoginInput,
  type LogoutInput,
  type RefreshTokenInput,
  type RegisterInput,
} from "./auth.schema.ts";
import { authService } from "./auth.service.ts";

export class AuthController {
  async register(req: Request, res: Response) {
    const data: RegisterInput = registerSchema.parse(req.body);
    const user = await authService.register(data);
    return sendCreated(res, user);
  }

  async login(req: Request, res: Response) {
    const data: LoginInput = loginSchema.parse(req.body);
    const user = await authService.login(data);
    return sendCreated(res, user);
  }

  async me(req: Request, res: Response) {
    const user = await authService.me(getUserId(req));
    return sendSuccess(res, user);
  }

  async refreshToken(req: Request, res: Response) {
    const { refreshToken }: RefreshTokenInput = refreshTokenSchema.parse(
      req.body,
    );

    const token = await authService.refreshAccessToken(refreshToken);
    return sendSuccess(res, token);
  }

  async logout(req: Request, res: Response) {
    const { refreshToken }: LogoutInput = logoutSchema.parse(req.body);
    const result = await authService.logout(refreshToken);
    return sendMessage(res, result.message);
  }
}

export const authController = new AuthController();
