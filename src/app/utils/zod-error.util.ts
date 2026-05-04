import status from "http-status";
import z from "zod";
import type { ErrorResponse, ErrorSource } from "../types";

export const parseSchema = <T>(
  schema: z.ZodType<T>,
  query: unknown,
  source: "body" | "query" = "query",
): T => {
  const result = schema.safeParse(query);

  if (!result.success) {
    const issues = result.error.issues.map((issue) => ({
      ...issue,
      path: issue.path.length ? [source, ...issue.path] : [source],
    }));

    throw new z.ZodError(issues);
  }

  return result.data;
};

export const handleZodError = (err: z.ZodError): ErrorResponse => {
  const errorSources: ErrorSource[] = err.issues.map((issue) => ({
    path: issue.path.length ? issue.path.join(" => ") : "root",
    message: issue.message,
  }));

  return {
    statusCode: status.BAD_REQUEST,
    success: false,
    message: "Validation failed",
    errorSources,
  };
};
