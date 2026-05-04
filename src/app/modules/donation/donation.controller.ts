import AppError from "@/app/utils/app-error.util";
import { asyncHandler } from "@/app/utils/async-handler.util";
import { sendResponse } from "@/app/utils/send-response.util";
import type { Request, Response } from "express";
import status from "http-status";
import { donationService } from "./donation.service";
import type { CreateDonationPayload, InitiateDonationPaymentPayload } from "./donation.type";

/**
 * Create a new donation
 * @route POST /api/v1/donations
 */
const createDonation = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const payload = req.body as CreateDonationPayload;

  const donation = await donationService.createDonation(userId, payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Donation created successfully",
    data: donation,
  });
});

/**
 * Initiate Stripe payment for a donation
 * @route POST /api/v1/donations/:donationId/payment
 */
const initiateDonationPayment = asyncHandler(async (req: Request, res: Response) => {
  const { donationId } = req.params;
  const payload = req.body as InitiateDonationPaymentPayload;

  if (!donationId || Array.isArray(donationId)) {
    throw new AppError(status.BAD_REQUEST, "Invalid donation ID");
  }

  const result = await donationService.initiateDonationPayment(donationId, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Payment session created successfully",
    data: result,
  });
});

/**
 * Get all donations (admin only)
 * @route GET /api/v1/donations
 */
const getAllDonations = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await donationService.getAllDonations(query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Donations fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

/**
 * Get my donations
 * @route GET /api/v1/donations/me
 */
const getMyDonations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const query = req.query;

  const result = await donationService.getMyDonations(userId, query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "My donations fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

/**
 * Get donations received for my requests
 * @route GET /api/v1/donations/received
 */
const getReceivedDonations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const query = req.query;

  const result = await donationService.getReceivedDonations(userId, query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Received donations fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const donationController = {
  createDonation,
  initiateDonationPayment,
  getAllDonations,
  getMyDonations,
  getReceivedDonations,
};
