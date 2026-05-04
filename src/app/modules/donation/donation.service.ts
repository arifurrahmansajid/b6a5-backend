import { stripe } from "@/app/config/stripe";
import { prisma } from "@/app/lib/prisma";
import AppError from "@/app/utils/app-error.util";
import { paginationUtils } from "@/app/utils/pagination.util";
import { parseSchema } from "@/app/utils/zod-error.util";
import type { Donation } from "@/generated/prisma/client";
import { DonationStatus, PaymentMethod } from "@/generated/prisma/enums";
import type { DonationWhereInput } from "@/generated/prisma/models";
import status from "http-status";
import Stripe from "stripe";
import type { CreateDonationPayload, InitiateDonationPaymentPayload } from "./donation.type";
import { donationListQuerySchema } from "./donation.validation";

/**
 * Create a donation record and return it
 */
const createDonation = async (userId: string, payload: CreateDonationPayload) => {
  // Verify request exists
  const request = await prisma.request.findUnique({
    where: { id: payload.requestId },
  });

  if (!request) {
    throw new AppError(status.NOT_FOUND, "Request not found");
  }

  // Verify campaign if provided
  if (payload.campaignId) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: payload.campaignId },
    });

    if (!campaign) {
      throw new AppError(status.NOT_FOUND, "Campaign not found");
    }
  }

  // Create donation with PENDING status
  const donation: Donation = await prisma.donation.create({
    data: {
      requestId: payload.requestId,
      donorId: userId,
      campaignId: payload.campaignId ?? null,
      amount: payload.amount,
      currency: payload.currency,
      status: DonationStatus.PENDING,
      notes: payload.notes ?? null,
      paymentMethod: PaymentMethod.STRIPE,
    },
  });

  return donation;
};

/**
 * Initiate Stripe payment for a donation
 */
const initiateDonationPayment = async (
  donationId: string,
  payload: InitiateDonationPaymentPayload,
) => {
  // Verify donation exists
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: { donor: true, request: true },
  });

  if (!donation) {
    throw new AppError(status.NOT_FOUND, "Donation not found");
  }

  // Already paid donations should not initiate payment
  if (donation.status === DonationStatus.COMPLETED) {
    throw new AppError(status.BAD_REQUEST, "Donation is already completed");
  }

  // Only PENDING donations can initiate payment
  if (donation.status !== DonationStatus.PENDING) {
    throw new AppError(
      status.BAD_REQUEST,
      `Cannot initiate payment for donation with status: ${donation.status}`,
    );
  }

  // Reuse existing session if exists and is still open
  if (donation.stripeSessionId) {
    const existingSession = await stripe.checkout.sessions.retrieve(donation.stripeSessionId);

    if (existingSession.status === "open") {
      return { paymentUrl: existingSession.url! };
    }
  }

  // Create new Stripe Checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: donation.donor.email,
    line_items: [
      {
        price_data: {
          currency: donation.currency.toLowerCase(),
          product_data: {
            name: `Donation for: ${donation.request.title}`,
            description: donation.notes ?? "Charity donation",
            metadata: { donationId: donation.id },
          },
          unit_amount: Math.round(Number(donation.amount) * 100),
        },
        quantity: 1,
      },
    ],

    metadata: {
      donationId: donation.id,
      donorId: donation.donorId,
      requestId: donation.requestId,
      campaignId: donation.campaignId,
    },

    success_url: payload.successUrl,
    cancel_url: payload.cancelUrl,
  });

  if (!checkoutSession.url) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create Stripe payment session");
  }

  await prisma.donation.update({
    where: { id: donation.id },
    data: { stripeSessionId: checkoutSession.id },
  });

  return { paymentUrl: checkoutSession.url };
};

/**
 * Handle Stripe webhook events for donations
 */
const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  // Prevent duplicate processing
  const existingEvent = await prisma.donation.findFirst({
    where: { stripeEventId: event.id },
  });

  if (existingEvent) {
    return {
      success: true,
      message: `Event ${event.id} already processed.`,
    };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const donationId = session.metadata?.donationId;

      if (!donationId) {
        return {
          success: false,
          message: "Missing donationId in metadata",
        };
      }

      const donation = await prisma.donation.findUnique({
        where: { id: donationId },
      });

      if (!donation) {
        return {
          success: false,
          message: `Donation with id ${donationId} not found`,
        };
      }

      // Update donation status based on payment status
      const newStatus =
        session.payment_status === "paid" ? DonationStatus.COMPLETED : DonationStatus.FAILED;

      // Extract payment intent ID
      const transactionId = session.payment_intent
        ? typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent.id
        : null;

      await prisma.donation.update({
        where: { id: donationId },
        data: {
          status: newStatus,
          stripeEventId: event.id,
          transactionId,
          stripePaymentIntentId: transactionId,
          paymentMetadata: session.metadata!,
        },
      });
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const donationId = session.metadata?.donationId;

      if (donationId) {
        await prisma.donation.update({
          where: { id: donationId },
          data: {
            status: DonationStatus.CANCELLED,
            stripeEventId: event.id,
          },
        });
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      const donation = await prisma.donation.findFirst({
        where: { stripePaymentIntentId: paymentIntent.id },
      });

      if (donation) {
        await prisma.donation.update({
          where: { id: donation.id },
          data: {
            status: DonationStatus.FAILED,
            stripeEventId: event.id,
          },
        });
      }
      break;
    }

    default:
      console.log(`[DONATION] Unhandled event type: ${event.type}`);
  }

  return {
    success: true,
    message: `Webhook event ${event.id} processed.`,
  };
};

/**
 * Get all donations (admin only)
 */
const getAllDonations = async (query: unknown) => {
  const typedQuery = parseSchema(donationListQuerySchema, query);
  const { page, limit, skip, take } = paginationUtils.getPaginationOptions(typedQuery);

  const where: DonationWhereInput = {};

  if (typedQuery.status) {
    const statuses = Array.isArray(typedQuery.status) ? typedQuery.status : [typedQuery.status];
    where.status = { in: statuses };
  }

  if (typedQuery.search) {
    where.OR = [
      {
        notes: {
          contains: typedQuery.search,
          mode: "insensitive",
        },
      },
      {
        request: {
          title: {
            contains: typedQuery.search,
            mode: "insensitive",
          },
        },
      },
      {
        request: {
          creator: {
            name: {
              contains: typedQuery.search,
              mode: "insensitive",
            },
          },
        },
      },
      {
        request: {
          creator: {
            email: {
              contains: typedQuery.search,
              mode: "insensitive",
            },
          },
        },
      },
      {
        request: {
          creator: {
            phone: {
              contains: typedQuery.search,
              mode: "insensitive",
            },
          },
        },
      },
      {
        donor: {
          name: {
            contains: typedQuery.search,
            mode: "insensitive",
          },
        },
      },
      {
        donor: {
          email: {
            contains: typedQuery.search,
            mode: "insensitive",
          },
        },
      },
      {
        donor: {
          phone: {
            contains: typedQuery.search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  const orderBy = paginationUtils.getOrderBy(typedQuery.sortBy, typedQuery.sortOrder, [
    "createdAt",
    "amount",
    "status",
  ]);

  const [total, donations] = await Promise.all([
    prisma.donation.count({ where }),
    prisma.donation.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        donor: {
          select: { id: true, name: true, email: true },
        },
        request: {
          select: {
            id: true,
            title: true,
            createdBy: true,
            creator: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        campaign: {
          select: { id: true, title: true },
        },
      },
    }),
  ]);

  return {
    data: donations,
    meta: paginationUtils.getPaginationMeta(total, page, limit),
  };
};

/**
 * Get donations made by the user
 */
const getMyDonations = async (userId: string, query: unknown) => {
  const typedQuery = parseSchema(donationListQuerySchema, query);
  const { page, limit, skip, take } = paginationUtils.getPaginationOptions(typedQuery);

  const where: DonationWhereInput = {
    donorId: userId,
  };

  if (typedQuery.status) {
    const statuses = Array.isArray(typedQuery.status) ? typedQuery.status : [typedQuery.status];
    where.status = { in: statuses };
  }

  if (typedQuery.search) {
    where.OR = [
      {
        notes: {
          contains: typedQuery.search,
          mode: "insensitive",
        },
      },
      {
        request: {
          title: {
            contains: typedQuery.search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  const orderBy = paginationUtils.getOrderBy(typedQuery.sortBy, typedQuery.sortOrder, [
    "createdAt",
    "amount",
    "status",
  ]);

  const [total, donations] = await Promise.all([
    prisma.donation.count({ where }),
    prisma.donation.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        request: {
          select: { id: true, title: true, createdBy: true },
        },
        campaign: {
          select: { id: true, title: true },
        },
      },
    }),
  ]);

  return {
    data: donations,
    meta: paginationUtils.getPaginationMeta(total, page, limit),
  };
};

/**
 * Get donations received for user's requests
 */
const getReceivedDonations = async (userId: string, query: unknown) => {
  const typedQuery = parseSchema(donationListQuerySchema, query);
  const { page, limit, skip, take } = paginationUtils.getPaginationOptions(typedQuery);

  const where: DonationWhereInput = {
    request: {
      createdBy: userId,
    },
  };

  if (typedQuery.status) {
    const statuses = Array.isArray(typedQuery.status) ? typedQuery.status : [typedQuery.status];
    where.status = { in: statuses };
  }

  if (typedQuery.search) {
    where.OR = [
      {
        notes: {
          contains: typedQuery.search,
          mode: "insensitive",
        },
      },
      {
        donor: {
          name: {
            contains: typedQuery.search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  const orderBy = paginationUtils.getOrderBy(typedQuery.sortBy, typedQuery.sortOrder, [
    "createdAt",
    "amount",
    "status",
  ]);

  const [total, donations] = await Promise.all([
    prisma.donation.count({ where }),
    prisma.donation.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        donor: {
          select: { id: true, name: true, email: true },
        },
        request: {
          select: { id: true, title: true },
        },
        campaign: {
          select: { id: true, title: true },
        },
      },
    }),
  ]);

  return {
    data: donations,
    meta: paginationUtils.getPaginationMeta(total, page, limit),
  };
};

export const donationService = {
  createDonation,
  initiateDonationPayment,
  handleStripeWebhookEvent,
  getAllDonations,
  getMyDonations,
  getReceivedDonations,
};
