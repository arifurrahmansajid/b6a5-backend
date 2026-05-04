import AppError from "@/app/utils/app-error.util";
import { asyncHandler } from "@/app/utils/async-handler.util";
import { sendResponse } from "@/app/utils/send-response.util";
import type { Request, Response } from "express";
import status from "http-status";
import { messageServices } from "./message.service";
import type { CreateMessagePayload, UpdateMessagePayload } from "./message.type";

const createMessage = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body as CreateMessagePayload;
  const user = req.user;

  const message = await messageServices.createMessage(user, payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Message sent successfully.",
    data: message,
  });
});

const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const query = req.query;

  const result = await messageServices.getMessages(user, query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Messages fetched successfully.",
    data: result.data,
    meta: result.meta,
  });
});

const getMyMessages = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const query = req.query;

  const result = await messageServices.getMyMessages(userId, query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "My messages fetched successfully.",
    data: result.data,
    meta: result.meta,
  });
});

const getMessageById = asyncHandler(async (req: Request, res: Response) => {
  const messageId = req.params.id;
  const user = req.user;

  if (!messageId || Array.isArray(messageId)) {
    throw new AppError(status.BAD_REQUEST, "Invalid message ID");
  }

  const message = await messageServices.getMessageById(messageId, user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Message fetched successfully.",
    data: message,
  });
});

const updateMessage = asyncHandler(async (req: Request, res: Response) => {
  const messageId = req.params.id;
  const payload = req.body as UpdateMessagePayload;
  const userId = req.user.id;

  if (!messageId || Array.isArray(messageId)) {
    throw new AppError(status.BAD_REQUEST, "Invalid message ID");
  }

  const updated = await messageServices.updateMessage(messageId, userId, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Message updated successfully.",
    data: updated,
  });
});

const deleteMessage = asyncHandler(async (req: Request, res: Response) => {
  const messageId = req.params.id;
  const userId = req.user.id;

  if (!messageId || Array.isArray(messageId)) {
    throw new AppError(status.BAD_REQUEST, "Invalid message ID");
  }

  const deleted = await messageServices.deleteMessage(messageId, userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Message deleted successfully.",
    data: deleted,
  });
});

const getConversation = asyncHandler(async (req: Request, res: Response) => {
  const requestId = req.params.requestId;
  const participantId = req.params.participantId;
  const userId = req.user.id;

  if (!requestId || Array.isArray(requestId)) {
    throw new AppError(status.BAD_REQUEST, "Invalid request ID");
  }

  if (!participantId || Array.isArray(participantId)) {
    throw new AppError(status.BAD_REQUEST, "Invalid user ID");
  }

  const messages = await messageServices.getConversation(requestId, userId, participantId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Conversation fetched successfully.",
    data: messages,
  });
});

export const messageController = {
  createMessage,
  getMessages,
  getMyMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
  getConversation,
};
