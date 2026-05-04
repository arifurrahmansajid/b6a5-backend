import type { Response } from "express";
import type { SendResponse } from "../types";

export const sendResponse = <T>(res: Response, responseData: SendResponse<T>) => {
  const { httpStatusCode, success, message, data, meta } = responseData;

  res.status(httpStatusCode).json({
    success,
    message,
    data,
    meta,
  });
};
