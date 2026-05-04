import AppError from "@/app/utils/app-error.util";
import { asyncHandler } from "@/app/utils/async-handler.util";
import { sendResponse } from "@/app/utils/send-response.util";
import type { Request, Response } from "express";
import status from "http-status";
import { requestServices } from "./request.service";
import type { CreateRequestPayload, UpdateRequestPayload } from "./request.type";

const createRequest = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body as CreateRequestPayload;
  const userId = req.user.id;

  const request = await requestServices.createRequest(userId, payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Request created successfully.",
    data: request,
  });
});

const getRequests = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await requestServices.getRequests(query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Requests fetched successfully.",
    data: result.data,
    meta: result.meta,
  });
});

const getMyRequests = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const query = req.query;

  const result = await requestServices.getMyRequests(userId, query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "My requests fetched successfully.",
    data: result.data,
    meta: result.meta,
  });
});

const getAllRequests = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await requestServices.getAllRequests(query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "All requests fetched successfully.",
    data: result.data,
    meta: result.meta,
  });
});

const getRequestById = asyncHandler(async (req: Request, res: Response) => {
  const requestId = req.params.id;

  if (!requestId || Array.isArray(requestId)) {
    throw new AppError(status.BAD_REQUEST, "Invalid request ID");
  }

  const request = await requestServices.getRequestById(requestId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Request fetched successfully.",
    data: request,
  });
});

const updateRequest = asyncHandler(async (req: Request, res: Response) => {
  const requestId = req.params.id;
  const payload = req.body as UpdateRequestPayload;
  const user = req.user;

  if (!requestId || Array.isArray(requestId)) {
    throw new AppError(status.BAD_REQUEST, "Invalid request ID");
  }

  const updated = await requestServices.updateRequest(requestId, user, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Request updated successfully.",
    data: updated,
  });
});

const deleteRequest = asyncHandler(async (req: Request, res: Response) => {
  const requestId = req.params.id;
  const userId = req.user.id;

  if (!requestId || Array.isArray(requestId)) {
    throw new AppError(status.BAD_REQUEST, "Invalid request ID");
  }

  const deleted = await requestServices.deleteRequest(requestId, userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Request deleted successfully.",
    data: deleted,
  });
});

export const requestController = {
  createRequest,
  getRequests,
  getMyRequests,
  getAllRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
};
