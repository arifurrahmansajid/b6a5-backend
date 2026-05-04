import type { NextFunction, Request, Response } from "express";
import status from "http-status";
import z from "zod";
import { getConfig } from "../config";
import type { ErrorResponse, ErrorSource } from "../types";
import AppError from "../utils/app-error.util";
import { handleZodError } from "../utils/zod-error.util";

export const globalError = async (err: any, req: Request, res: Response, next: NextFunction) => {
  const config = getConfig();

  if (config.nodeEnv === "development") {
    console.error("❌ [GLOBAL ERROR]", err);
  }

  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal server error";
  let stack: string | undefined = undefined;
  let errorSources: ErrorSource[] = [];

  if (err instanceof z.ZodError) {
    const simplifiedError = handleZodError(err);

    statusCode = simplifiedError.statusCode!;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources!;
    stack = err.stack;

    //
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;

    //
  } else if (err instanceof Error) {
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = err.message;
    stack = err.stack;
  }

  const errorResponse: ErrorResponse = {
    success: false,
    message,
    errorSources,
    stack: config.nodeEnv === "development" ? stack : undefined,
    error: config.nodeEnv === "development" ? err : undefined,
  };

  res.status(statusCode).json(errorResponse);
};
