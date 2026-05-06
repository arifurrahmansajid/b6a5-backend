import { paginationUtils } from "@/app/utils/pagination.util";
import { DonationStatus } from "@/generated/prisma/enums";
import z from "zod";

export const createDonationSchema = z.object({
  requestId: z.uuid("Invalid request ID"),
  campaignId: z.uuid("Invalid campaign ID").optional(),
  amount: z.string().transform((val) => {
    const parsed = parseFloat(val);
    if (isNaN(parsed) || parsed <= 0) {
      throw new Error("Amount must be a positive number");
    }
    return parsed;
  }),
  currency: z.string().length(3).default("BDT").describe("ISO 4217 currency code"),
  notes: z.string().max(500).optional(),
});

export const initiateDonationPaymentSchema = z.object({
  successUrl: z.url("Invalid success URL"),
  cancelUrl: z.url("Invalid cancel URL"),
});

export const donationListQuerySchema = paginationUtils.paginationQuerySchema.extend({
  status: z.union([z.enum(DonationStatus), z.array(z.enum(DonationStatus))]).optional(),
  search: z.string().optional(),
});

export const updateDonationStatusSchema = z.object({
  status: z.nativeEnum(DonationStatus),
});
