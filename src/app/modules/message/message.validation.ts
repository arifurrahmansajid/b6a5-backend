import { paginationUtils } from "@/app/utils/pagination.util";
import { z } from "zod";

export const createMessageSchema = z.object({
  receiverId: z.string(),
  requestId: z.string(),
  message: z.string().min(1).max(1000),
});

export const updateMessageSchema = z
  .object({
    message: z.string().min(1).max(1000).optional(),
    isRead: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required for update",
  });

export const messageListQuerySchema = paginationUtils.paginationQuerySchema.extend({
  requestId: z.string().optional(),
  senderId: z.string().optional(),
  receiverId: z.string().optional(),
  isRead: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  search: z.string().optional(),
});
