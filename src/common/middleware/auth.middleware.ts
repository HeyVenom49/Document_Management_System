import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.ts";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer "))
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });

    const token = authHeader.split(" ")[1]!;

    const payload = verifyAccessToken(token);

    req.user = {
      userId: payload.userId,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
}
