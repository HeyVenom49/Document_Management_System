import type { Request, Response } from "express";
import { getUserId } from "../../common/http/request.ts";
import { sendCreated, sendMessage, sendSuccess } from "../../common/http/response.ts";
import {
  clearRefreshTokenCookie,
  getRefreshTokenFromRequest,
  setRefreshTokenCookie,
} from "../../common/utils/cookies.ts";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
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
    const result = await authService.login(data);

    setRefreshTokenCookie(res, result.refreshToken);

    return sendCreated(res, {
      id: result.id,
      accessToken: result.accessToken,
    });
  }

  async me(req: Request, res: Response) {
    const user = await authService.me(getUserId(req));
    return sendSuccess(res, user);
  }

  async refreshToken(req: Request, res: Response) {
    const refreshToken = getRefreshTokenFromRequest(req);
    const result = await authService.refreshAccessToken(refreshToken);

    setRefreshTokenCookie(res, result.refreshToken);

    return sendSuccess(res, {
      accessToken: result.accessToken,
    });
  }

  async logout(req: Request, res: Response) {
    const refreshToken = getRefreshTokenFromRequest(req);
    const result = await authService.logout(refreshToken);

    clearRefreshTokenCookie(res);

    return sendMessage(res, result.message);
  }
}

export const authController = new AuthController();
