import type z from "zod";
import type { createResponseSchema, updateResponseSchema } from "./response.validation";

export type CreateResponsePayload = z.infer<typeof createResponseSchema>;
export type UpdateResponsePayload = z.infer<typeof updateResponseSchema>;
