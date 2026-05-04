import type { Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import type { StringValue } from "ms";
import { getConfig } from "../config";
import { TOKEN_CONFIG } from "../constants/token.const";
import { cookieUtils } from "./cookie.util";
import { jwtUtils } from "./jwt.util";

const config = getConfig();
const { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME, BETTER_AUTH_SESSION_TOKEN_NAME } = TOKEN_CONFIG;

const generateAccessToken = (payload: JwtPayload) => {
  const accessToken = jwtUtils.generateToken(
    payload,
    config.jwt.accessToken.secret,
    config.jwt.accessToken.expiresIn as StringValue,
  );

  return accessToken;
};

const generateRefreshToken = (payload: JwtPayload) => {
  const refreshToken = jwtUtils.generateToken(
    payload,
    config.jwt.refreshToken.secret,
    config.jwt.refreshToken.expiresIn as StringValue,
  );

  return refreshToken;
};

const setAccessTokenToCookie = (res: Response, token: string) => {
  const options = cookieUtils.cookieOptions(config.jwt.accessToken.expiresIn);

  cookieUtils.setCookie(res, ACCESS_TOKEN_NAME, token, options);
};

const setRefreshTokenToCookie = (res: Response, token: string) => {
  const options = cookieUtils.cookieOptions(config.jwt.refreshToken.expiresIn);

  cookieUtils.setCookie(res, REFRESH_TOKEN_NAME, token, options);
};

const setBetterAuthSessionTokenToCookie = (res: Response, token: string) => {
  const options = cookieUtils.cookieOptions(config.betterAuth.sessionToken.expiresIn);

  cookieUtils.setCookie(res, BETTER_AUTH_SESSION_TOKEN_NAME, token, options);
};

const clearAccessTokenFromCookie = (res: Response) => {
  const options = cookieUtils.cookieOptions("0");
  cookieUtils.clearCookie(res, ACCESS_TOKEN_NAME, options);
};

const clearRefreshTokenFromCookie = (res: Response) => {
  const options = cookieUtils.cookieOptions("0");
  cookieUtils.clearCookie(res, REFRESH_TOKEN_NAME, options);
};

const clearBetterAuthSessionTokenFromCookie = (res: Response) => {
  const options = cookieUtils.cookieOptions("0");
  cookieUtils.clearCookie(res, BETTER_AUTH_SESSION_TOKEN_NAME, options);
};

export const tokenUtils = {
  generateAccessToken,
  generateRefreshToken,
  setAccessTokenToCookie,
  setRefreshTokenToCookie,
  setBetterAuthSessionTokenToCookie,
  clearAccessTokenFromCookie,
  clearRefreshTokenFromCookie,
  clearBetterAuthSessionTokenFromCookie,
};
