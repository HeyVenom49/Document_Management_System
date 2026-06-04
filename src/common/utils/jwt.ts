import jwt, { type SignOptions } from "jsonwebtoken";
import { AppError } from "../errors/app.error.ts";
import { Unauthorized } from "../errors/unauthorized.error.ts";

type AccessTokenType = {
  userId: string;
};

const getEnvVariable = (key: string) => {
  const value = process.env[key];

  if (!value) throw new AppError(`${key} is missing`, 500);

  return value;
};

const accessToken = getEnvVariable("JWT_ACCESS_TOKEN");

type TokenExpireIn = NonNullable<SignOptions["expiresIn"]>;

const accessTokenExpire = getEnvVariable(
  "JWT_ACCESS_TOKEN_EXPIRE",
) as TokenExpireIn;

const accessTokenSignOption: SignOptions = { expiresIn: accessTokenExpire };

const generateAccessToken = (payload: AccessTokenType) => {
  return jwt.sign(payload, accessToken, accessTokenSignOption);
};

const verifyAccessToken = (token: string) => {
  const payload = jwt.verify(token, accessToken);

  if (typeof payload === "string" || typeof payload.userId !== "string")
    throw new Unauthorized("Invalid access token payload");

  return {
    userId: payload.userId,
  };
};

export { generateAccessToken, verifyAccessToken };
