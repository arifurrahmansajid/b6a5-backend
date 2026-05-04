import { paginationUtils } from "@/app/utils/pagination.util";
import { Category, HelpType, RequestStatus, Urgency } from "@/generated/prisma/enums";
import { z } from "zod";

export const createRequestSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(5000),
  category: z.enum(Category),
  urgency: z.enum(Urgency),
  helpType: z.enum(HelpType),
  location: z.string().max(150).optional(),
  isAnonymous: z.boolean().optional().default(false),
  expiresAt: z.preprocess(
    (val) => (val ? new Date(val as string) : undefined),
    z.date().optional(),
  ),
  status: z.enum(RequestStatus).optional(),
});

export const updateRequestSchema = createRequestSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required for update",
  });

export const requestListQuerySchema = paginationUtils.paginationQuerySchema.extend({
  category: z.enum(Category).optional(),
  urgency: z.union([z.enum(Urgency), z.array(z.enum(Urgency))]).optional(),
  helpType: z.enum(HelpType).optional(),
  status: z.union([z.enum(RequestStatus), z.array(z.enum(RequestStatus))]).optional(),
  createdBy: z.uuid().optional(),
  search: z.string().optional(),
});
