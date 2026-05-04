import { paginationUtils } from "@/app/utils/pagination.util";
import { Role, UserStatus, UserType } from "@/generated/prisma/enums";
import z from "zod";

export const onboardingSchema = z.object({
  types: z
    .array(z.enum(UserType))
    .nonempty("At least one type must be selected")
    .refine((arr) => new Set(arr).size === arr.length, "Duplicate types are not allowed"),

  // Optional org fields, only relevant if ORGANIZATION type is selected
  orgName: z.string().max(200).optional(),
  description: z.string().optional(),
  logoUrl: z.url().optional(),
  website: z.url().optional(),
  registrationNumber: z.string().max(100).optional(),
  contactEmail: z.email().optional(),
  contactPhone: z.string().optional(),
});

export const userListQuerySchema = paginationUtils.paginationQuerySchema.extend({
  role: z.union([z.enum(Role), z.array(z.enum(Role))]).optional(),
  status: z.union([z.enum(UserStatus), z.array(z.enum(UserStatus))]).optional(),
  search: z.string().optional(),
});

export const updateUserTypeStatusSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "REJECTED", "SUSPENDED"]),
});

export type OnboardingPayload = z.infer<typeof onboardingSchema>;
export type UpdateUserTypeStatusPayload = z.infer<typeof updateUserTypeStatusSchema>;
