import type { CookieOptions, Request, Response } from "express";
import { Unauthorized } from "../errors/unauthorized.error.ts";

export const REFRESH_TOKEN_COOKIE = "refresh_token";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.ENVIRONMENT === "production",
  sameSite: "strict",
  maxAge: THIRTY_DAYS_MS,
  path: "/auth",
});

export const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_TOKEN_COOKIE, token, getRefreshTokenCookieOptions());
};

export const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie(REFRESH_TOKEN_COOKIE, getRefreshTokenCookieOptions());
};

export const getRefreshTokenFromRequest = (req: Request): string => {
  const cookieToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
  const bodyToken =
    typeof req.body?.refreshToken === "string" ? req.body.refreshToken : undefined;

  const token = cookieToken ?? bodyToken;

  if (!token) {
    throw new Unauthorized("Refresh token is required");
  }

  return token;
};
