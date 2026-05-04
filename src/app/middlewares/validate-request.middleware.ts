import { parseSchema } from "@/app/utils/zod-error.util";
import type { NextFunction, Request, Response } from "express";
import type z from "zod";

export const validateRequest = (zodSchema: z.ZodType) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (req.body?.data && typeof req.body.data === "string") {
        req.body = JSON.parse(req.body.data);
      }
      req.body = parseSchema(zodSchema, req.body, "body");
      next();
    } catch (error) {
      next(error);
    }
  };
};
