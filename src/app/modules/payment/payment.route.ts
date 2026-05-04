import express, { Router } from "express";
import { paymentController } from "./payment.controller";

const router: Router = Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleStripeWebhook,
);

export const paymentRoutes = router;
