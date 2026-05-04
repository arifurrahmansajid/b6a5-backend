import type z from "zod";
import type { createDonationSchema, initiateDonationPaymentSchema } from "./donation.validation";

export type CreateDonationPayload = z.infer<typeof createDonationSchema>;

export type InitiateDonationPaymentPayload = z.infer<typeof initiateDonationPaymentSchema>;
