import { paginationUtils } from "@/app/utils/pagination.util";
import { Category, HelpType, RequestStatus, ResponseType, Urgency } from "@/generated/prisma/enums";
import { z } from "zod";

export const createResponseSchema = z.object({
  requestId: z.uuid(),
  responseType: z.enum(ResponseType),
  message: z.string().max(1000).optional(),
});

export const updateResponseSchema = z
  .object({
    responseType: z.enum(ResponseType).optional(),
    message: z.string().max(1000).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required for update",
  });

export const responseListQuerySchema = paginationUtils.paginationQuerySchema.extend({
  requestId: z.uuid().optional(),
  responseType: z.enum(ResponseType).optional(),
  category: z.enum(Category).optional(),
  urgency: z.union([z.enum(Urgency), z.array(z.enum(Urgency))]).optional(),
  helpType: z.enum(HelpType).optional(),
  status: z.union([z.enum(RequestStatus), z.array(z.enum(RequestStatus))]).optional(),
  createdBy: z.uuid().optional(),
  search: z.string().optional(),
});
