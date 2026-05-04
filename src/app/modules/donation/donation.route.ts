import { auth } from "@/app/middlewares/auth-middleware";
import { validateRequest } from "@/app/middlewares/validate-request.middleware";
import { Role } from "@/generated/prisma/enums";
import { Router } from "express";
import { donationController } from "./donation.controller";
import { createDonationSchema, initiateDonationPaymentSchema } from "./donation.validation";

const router: Router = Router();

/**
 * Create a new donation
 */
router.post("/", auth(), validateRequest(createDonationSchema), donationController.createDonation);

/**
 * Initiate Stripe payment for a donation
 */
router.post(
  "/:donationId/payment",
  auth(),
  validateRequest(initiateDonationPaymentSchema),
  donationController.initiateDonationPayment,
);

/**
 * Get all donations (admin only)
 */
router.get("/", auth([Role.ADMIN, Role.SUPER_ADMIN]), donationController.getAllDonations);

/**
 * Get my donations
 */
router.get("/me", auth(), donationController.getMyDonations);

/**
 * Get donations received for my requests
 */
router.get("/received", auth(), donationController.getReceivedDonations);

export const donationRoutes = router;
