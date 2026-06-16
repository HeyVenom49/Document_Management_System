import type { Request } from "express";
import { Unauthorized } from "../errors/unauthorized.error.ts";

export const getUserId = (req: Request): string => {
  const userId = req.user?.userId;

  if (!userId) throw new Unauthorized();

  return userId;
};
