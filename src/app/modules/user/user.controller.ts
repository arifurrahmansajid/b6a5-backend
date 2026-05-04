import { TOKEN_CONFIG } from "@/app/constants/token.const";
import AppError from "@/app/utils/app-error.util";
import { asyncHandler } from "@/app/utils/async-handler.util";
import { cookieUtils } from "@/app/utils/cookie.util";
import { sendResponse } from "@/app/utils/send-response.util";
import { tokenUtils } from "@/app/utils/token.util";
import { UserTypeStatus } from "@/generated/prisma/enums";
import type { Request, Response } from "express";
import status from "http-status";
import { userServices } from "./user.service";

const onboarding = asyncHandler(async (req: Request, res: Response) => {
  const currentSessionToken = cookieUtils.getCookie(
    req,
    TOKEN_CONFIG.BETTER_AUTH_SESSION_TOKEN_NAME,
  );
  if (!currentSessionToken) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access! No session token provided.");
  }

  const { body: payload, user } = req;
  const result = await userServices.onboarding(user.id, payload);

  const { accessToken, refreshToken, userTypeEntries } = result;

  const totalTypes = userTypeEntries.length;

  const pendingCount = userTypeEntries.filter(
    (entry) => entry.status === UserTypeStatus.PENDING,
  ).length;

  let message = "Onboarding completed.";

  if (pendingCount === totalTypes) {
    message += " Roles are pending admin approval.";
  } else if (pendingCount > 0) {
    message += " Some roles are pending admin approval.";
  } else {
    message += " Roles are active.";
  }

  tokenUtils.setAccessTokenToCookie(res, accessToken);
  tokenUtils.setRefreshTokenToCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionTokenToCookie(res, currentSessionToken);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message,
    data: {
      token: currentSessionToken,
      ...result,
    },
  });
});

const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await userServices.getAllUsers(query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "All users fetched successfully.",
    data: result.data,
    meta: result.meta,
  });
});

const getAllVolunteers = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await userServices.getAllVolunteers(query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "All volunteers fetched successfully.",
    data: result.data,
    meta: result.meta,
  });
});

const getAllDonors = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await userServices.getAllDonors(query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "All donors fetched successfully.",
    data: result.data,
    meta: result.meta,
  });
});

const getAllOrganizations = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await userServices.getAllOrganizations(query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "All organizations fetched successfully.",
    data: result.data,
    meta: result.meta,
  });
});

const updateUserTypeStatus = asyncHandler(async (req: Request, res: Response) => {
  const { userTypeEntryId } = req.params as { userTypeEntryId: string };
  const { status: newStatus } = req.body as { status: UserTypeStatus };

  const result = await userServices.updateUserTypeStatus(userTypeEntryId, newStatus);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User type status updated successfully.",
    data: result,
  });
});

export const userController = {
  onboarding,
  getAllUsers,
  getAllVolunteers,
  getAllDonors,
  getAllOrganizations,
  updateUserTypeStatus,
};
