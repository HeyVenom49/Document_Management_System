import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "./auth.schema.ts";
import { authService } from "./auth.service.ts";

export class AuthController {
  async register(req: Request, res: Response) {
    const data = registerSchema.parse(req.body);

    const user = await authService.register(data);

    return res.status(201).json({
      success: true,
      data: user,
    });
  }

  async login(req: Request, res: Response) {
    const data = loginSchema.parse(req.body);

    const user = await authService.login(data);

    return res.status(201).json({
      success: true,
      data: user,
    });
  }
}

export const authController = new AuthController();
