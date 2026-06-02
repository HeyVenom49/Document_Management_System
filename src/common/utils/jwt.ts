import jwt, { type SignOptions } from "jsonwebtoken";

type AccessTokenType = {
  username: string;
  email: string;
};

const getEnvVariable = (key: string) => {
  const value = process.env[key];

  if (!value) throw new Error(`${key} is missing`);

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
  return jwt.verify(token, accessToken);
};

export { generateAccessToken, verifyAccessToken };
