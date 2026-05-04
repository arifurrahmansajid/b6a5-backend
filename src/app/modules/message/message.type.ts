import type z from "zod";
import type { createMessageSchema, updateMessageSchema } from "./message.validation";

export type CreateMessagePayload = z.infer<typeof createMessageSchema>;
export type UpdateMessagePayload = z.infer<typeof updateMessageSchema>;
