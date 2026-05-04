import { TOKEN_CONFIG } from "@/app/constants/token.const";
import AppError from "@/app/utils/app-error.util";
import { asyncHandler } from "@/app/utils/async-handler.util";
import { cookieUtils } from "@/app/utils/cookie.util";
import { sendResponse } from "@/app/utils/send-response.util";
import { tokenUtils } from "@/app/utils/token.util";
import type { Request, Response } from "express";
import status from "http-status";
import { authServices } from "./auth.service";

const { BETTER_AUTH_SESSION_TOKEN_NAME, REFRESH_TOKEN_NAME } = TOKEN_CONFIG;

const signUp = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await authServices.signUp(payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Signup successful. Please verify your email.",
    data: result,
  });
});

const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await authServices.verifyEmail(payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Email verified successfully.",
    data: result,
  });
});

const signIn = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await authServices.signIn(payload);

  const { accessToken, refreshToken, token } = result;

  tokenUtils.setAccessTokenToCookie(res, accessToken);
  tokenUtils.setRefreshTokenToCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionTokenToCookie(res, token);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "You have successfully signed in.",
    data: result,
  });
});

const refreshTokens = asyncHandler(async (req: Request, res: Response) => {
  const currentSessionToken = cookieUtils.getCookie(req, BETTER_AUTH_SESSION_TOKEN_NAME);
  const currentRefreshToken = cookieUtils.getCookie(req, REFRESH_TOKEN_NAME);

  if (!currentSessionToken) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access! No session token provided.");
  }

  if (!currentRefreshToken) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access! No refresh token provided.");
  }

  const result = await authServices.refreshTokens(currentSessionToken, currentRefreshToken);

  const { accessToken, refreshToken, token } = result;

  tokenUtils.setAccessTokenToCookie(res, accessToken);
  tokenUtils.setRefreshTokenToCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionTokenToCookie(res, token);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Tokens refreshed successfully.",
    data: result,
  });
});

const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body;
  const currentSessionToken = cookieUtils.getCookie(req, BETTER_AUTH_SESSION_TOKEN_NAME);

  if (!currentSessionToken) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access! No session token provided.");
  }

  const result = await authServices.changePassword(payload, currentSessionToken);

  const { accessToken, refreshToken, token } = result;

  tokenUtils.setAccessTokenToCookie(res, accessToken);
  tokenUtils.setRefreshTokenToCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionTokenToCookie(res, token!);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password changed successfully.",
    data: result,
  });
});

const requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body;
  await authServices.requestPasswordReset(payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "If an account exists, a password reset OTP has been sent.",
  });
});

const passwordReset = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body;
  await authServices.passwordReset(payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password reset successfully.",
  });
});

const logout = asyncHandler(async (req: Request, res: Response) => {
  const currentSessionToken = cookieUtils.getCookie(req, BETTER_AUTH_SESSION_TOKEN_NAME);

  if (!currentSessionToken) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access! No session token provided.");
  }

  const result = await authServices.logout(currentSessionToken);

  tokenUtils.clearAccessTokenFromCookie(res);
  tokenUtils.clearRefreshTokenFromCookie(res);
  tokenUtils.clearBetterAuthSessionTokenFromCookie(res);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Logged out successfully.",
    data: result,
  });
});

const getSession = asyncHandler(async (req: Request, res: Response) => {
  const currentSessionToken = cookieUtils.getCookie(req, BETTER_AUTH_SESSION_TOKEN_NAME);

  if (!currentSessionToken) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access! No session token provided.");
  }

  const userId = req.user.id;
  const result = await authServices.getSession(currentSessionToken, userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Session fetched successfully.",
    data: result,
  });
});

export const authController = {
  signUp,
  verifyEmail,
  signIn,
  refreshTokens,
  changePassword,
  requestPasswordReset,
  passwordReset,
  logout,
  getSession,
};
