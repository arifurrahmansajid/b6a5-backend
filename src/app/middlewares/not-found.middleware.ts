import type { Request, Response } from "express";
import status from "http-status";
import { sendResponse } from "../utils/send-response.util";

export const notFound = (req: Request, res: Response) => {
  sendResponse(res, {
    httpStatusCode: status.NOT_FOUND,
    success: false,
    message: `Endpoint not found: ${req.method} ${req.path}`,
  });
};
