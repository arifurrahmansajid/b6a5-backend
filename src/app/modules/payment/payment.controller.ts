import { getConfig } from "@/app/config";
import { stripe } from "@/app/config/stripe";
import AppError from "@/app/utils/app-error.util";
import { asyncHandler } from "@/app/utils/async-handler.util";
import { sendResponse } from "@/app/utils/send-response.util";
import type { Request, Response } from "express";
import status from "http-status";
import Stripe from "stripe";
import { donationService } from "../donation/donation.service";

const config = getConfig();

const handleStripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;
  const webhookSecret = config.stripe.webhookSecret;

  if (!signature || !webhookSecret) {
    throw new AppError(status.BAD_REQUEST, "Missing Stripe signature or webhook secret");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error: any) {
    throw new AppError(status.BAD_REQUEST, `Webhook Error: ${error.message}`);
  }

  try {
    const result = await donationService.handleStripeWebhookEvent(event);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Webhook processed successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: false,
      message: `Webhook processing failed: ${error.message}`,
    });
  }
});

export const paymentController = {
  handleStripeWebhook,
};
