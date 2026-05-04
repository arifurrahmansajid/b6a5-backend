import AppError from "@/app/utils/app-error.util";
import { asyncHandler } from "@/app/utils/async-handler.util";
import { sendResponse } from "@/app/utils/send-response.util";
import type { Request, Response } from "express";
import status from "http-status";
import { responseServices } from "./response.service";
import type { CreateResponsePayload, UpdateResponsePayload } from "./response.type";

const createResponse = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body as CreateResponsePayload;
  const user = req.user;

  const response = await responseServices.createResponse(user, payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Response created successfully.",
    data: response,
  });
});

const getResponses = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const query = req.query;

  const result = await responseServices.getResponses(user, query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Responses fetched successfully.",
    data: result.data,
    meta: result.meta,
  });
});

const getMyResponses = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const query = req.query;

  const result = await responseServices.getMyResponses(userId, query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "My responses fetched successfully.",
    data: result.data,
    meta: result.meta,
  });
});

const getResponseById = asyncHandler(async (req: Request, res: Response) => {
  const responseId = req.params.id;
  const user = req.user;

  if (!responseId || Array.isArray(responseId)) {
    throw new AppError(status.BAD_REQUEST, "Invalid response ID");
  }

  const response = await responseServices.getResponseById(responseId, user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Response fetched successfully.",
    data: response,
  });
});

const updateResponse = asyncHandler(async (req: Request, res: Response) => {
  const responseId = req.params.id;
  const payload = req.body as UpdateResponsePayload;
  const userId = req.user.id;

  if (!responseId || Array.isArray(responseId)) {
    throw new AppError(status.BAD_REQUEST, "Invalid response ID");
  }

  const updated = await responseServices.updateResponse(responseId, userId, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Response updated successfully.",
    data: updated,
  });
});

const deleteResponse = asyncHandler(async (req: Request, res: Response) => {
  const responseId = req.params.id;
  const userId = req.user.id;

  if (!responseId || Array.isArray(responseId)) {
    throw new AppError(status.BAD_REQUEST, "Invalid response ID");
  }

  const deleted = await responseServices.deleteResponse(responseId, userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Response deleted successfully.",
    data: deleted,
  });
});

export const responseController = {
  createResponse,
  getResponses,
  getMyResponses,
  getResponseById,
  updateResponse,
  deleteResponse,
};
