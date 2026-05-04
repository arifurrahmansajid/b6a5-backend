import type z from "zod";
import type { createRequestSchema, updateRequestSchema } from "./request.validation";

export type CreateRequestPayload = z.infer<typeof createRequestSchema>;
export type UpdateRequestPayload = z.infer<typeof updateRequestSchema>;
