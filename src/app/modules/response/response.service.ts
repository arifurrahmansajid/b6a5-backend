import { prisma } from "@/app/lib/prisma";
import type { TokenPayload } from "@/app/types";
import AppError from "@/app/utils/app-error.util";
import { paginationUtils } from "@/app/utils/pagination.util";
import { parseSchema } from "@/app/utils/zod-error.util";
import { RequestStatus, Role } from "@/generated/prisma/enums";
import type { ResponseInclude, ResponseWhereInput } from "@/generated/prisma/models";
import status from "http-status";
import { responseConsts } from "./response.const";
import { responseRepository } from "./response.repository";
import type { CreateResponsePayload, UpdateResponsePayload } from "./response.type";
import { responseListQuerySchema } from "./response.validation";

const createResponse = async (user: TokenPayload, payload: CreateResponsePayload) => {
  // Check if user has already responded to this request
  const existingResponse = await responseRepository.findByRequestAndUser(
    payload.requestId,
    user.id,
  );

  if (existingResponse) {
    throw new AppError(status.BAD_REQUEST, "You have already responded to this request");
  }

  // Check if request exists and is open
  const request = await prisma.request.findUnique({
    where: { id: payload.requestId },
    select: { status: true, createdBy: true },
  });

  if (!request) {
    throw new AppError(status.NOT_FOUND, "Request not found");
  }

  if (request.status !== RequestStatus.OPEN) {
    throw new AppError(status.BAD_REQUEST, "You can only respond to open requests");
  }

  if (request.createdBy === user.id) {
    throw new AppError(status.BAD_REQUEST, "You are not allowed to respond to your own request.");
  }

  return responseRepository.create({
    ...payload,
    userId: user.id,
  });
};

const getResponses = async (user: TokenPayload, query: unknown) => {
  const typedQuery = parseSchema(responseListQuerySchema, query);
  const { page, limit, skip, take } = paginationUtils.getPaginationOptions(typedQuery);

  const where: ResponseWhereInput = {};

  const isAdmin = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;

  if (typedQuery.requestId) {
    const request = await prisma.request.findUnique({
      where: { id: typedQuery.requestId },
      select: { createdBy: true },
    });

    if (!request) {
      throw new AppError(status.NOT_FOUND, "Request not found");
    }

    const isOwner = request.createdBy === user.id;

    if (!isOwner && !isAdmin) {
      throw new AppError(status.FORBIDDEN, "You can only view responses to your own requests");
    }

    where.requestId = typedQuery.requestId;
  }

  where.request = {
    is: {
      ...(typedQuery.status && {
        status: Array.isArray(typedQuery.status) ? { in: typedQuery.status } : typedQuery.status,
      }),
      ...(typedQuery.category && { category: typedQuery.category }),
      ...(typedQuery.urgency && {
        urgency: Array.isArray(typedQuery.urgency)
          ? { in: typedQuery.urgency }
          : typedQuery.urgency,
      }),
      ...(typedQuery.helpType && { helpType: typedQuery.helpType }),
    },
  };

  if (typedQuery.responseType) where.responseType = typedQuery.responseType;
  if (typedQuery.createdBy) where.userId = typedQuery.createdBy;

  if (typedQuery.search?.trim()) {
    const search = typedQuery.search.trim();

    where.OR = [
      { request: { title: { contains: search, mode: "insensitive" } } },
      { request: { creator: { name: { contains: search, mode: "insensitive" } } } },
      { request: { creator: { email: { contains: search, mode: "insensitive" } } } },
      { request: { creator: { phone: { contains: search, mode: "insensitive" } } } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { user: { phone: { contains: search, mode: "insensitive" } } },
    ];
  }

  const orderBy = paginationUtils.getOrderBy(
    typedQuery.sortBy,
    typedQuery.sortOrder,
    responseConsts.allowedSortByFields,
  );

  const include: ResponseInclude = {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
      },
    },
    request: {
      select: {
        id: true,
        title: true,
        status: true,
        category: true,
        urgency: true,
        helpType: true,
        expiresAt: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    },
  };

  const [total, responses] = await Promise.all([
    responseRepository.count(where),
    responseRepository.findMany(where, skip, take, orderBy, { include }),
  ]);

  return {
    data: responses,
    meta: paginationUtils.getPaginationMeta(total, page, limit),
  };
};

const getMyResponses = async (userId: string, query: unknown) => {
  const typedQuery = parseSchema(responseListQuerySchema, query);
  const { page, limit, skip, take } = paginationUtils.getPaginationOptions(typedQuery);

  const where: ResponseWhereInput = { userId };

  where.request = {
    is: {
      ...(typedQuery.status && {
        status: Array.isArray(typedQuery.status) ? { in: typedQuery.status } : typedQuery.status,
      }),
      ...(typedQuery.category && { category: typedQuery.category }),
      ...(typedQuery.urgency && {
        urgency: Array.isArray(typedQuery.urgency)
          ? { in: typedQuery.urgency }
          : typedQuery.urgency,
      }),
      ...(typedQuery.helpType && { helpType: typedQuery.helpType }),
    },
  };

  if (typedQuery.requestId) where.requestId = typedQuery.requestId;
  if (typedQuery.responseType) where.responseType = typedQuery.responseType;

  if (typedQuery.search) {
    const search = typedQuery.search.trim();
    where.OR = [
      { request: { title: { contains: search, mode: "insensitive" } } },
      { request: { description: { contains: search, mode: "insensitive" } } },
      { request: { creator: { name: { contains: search, mode: "insensitive" } } } },
      { request: { creator: { email: { contains: search, mode: "insensitive" } } } },
      { request: { creator: { phone: { contains: search, mode: "insensitive" } } } },
    ];
  }

  const orderBy = paginationUtils.getOrderBy(
    typedQuery.sortBy,
    typedQuery.sortOrder,
    responseConsts.allowedSortByFields,
  );

  const [total, responses] = await Promise.all([
    responseRepository.count(where),
    responseRepository.findMany(where, skip, take, orderBy, {
      include: {
        request: {
          select: {
            id: true,
            title: true,
            status: true,
            category: true,
            urgency: true,
            helpType: true,
            expiresAt: true,
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatarUrl: true,
                role: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    data: responses,
    meta: paginationUtils.getPaginationMeta(total, page, limit),
  };
};

const getResponseById = async (id: string, user: TokenPayload) => {
  const response = await responseRepository.findById(id, {
    include: {
      request: {
        select: {
          id: true,
          title: true,
          status: true,
          category: true,
          urgency: true,
          helpType: true,
          expiresAt: true,
          creator: {
            select: {
              name: true,
              email: true,
              phone: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  if (!response) {
    throw new AppError(status.NOT_FOUND, "Response not found");
  }

  // Allow access if user is the responder, request owner, or admin
  const isResponder = response.userId === user.id;
  const isAdmin = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;

  if (!isResponder && !isAdmin) {
    throw new AppError(status.FORBIDDEN, "You do not have permission to view this response");
  }

  return response;
};

const updateResponse = async (id: string, userId: string, payload: UpdateResponsePayload) => {
  const existing = await responseRepository.findById(id);

  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Response not found");
  }

  if (existing.userId !== userId) {
    throw new AppError(status.FORBIDDEN, "You can only update your own responses");
  }

  // Check if request is still open
  const request = await prisma.request.findUnique({
    where: { id: existing.requestId },
    select: { status: true },
  });

  if (request?.status !== RequestStatus.OPEN) {
    throw new AppError(status.BAD_REQUEST, "Cannot update response for a non-open request");
  }

  return responseRepository.update(id, payload);
};

const deleteResponse = async (id: string, userId: string) => {
  const existing = await responseRepository.findById(id);

  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Response not found");
  }

  if (existing.userId !== userId) {
    throw new AppError(status.FORBIDDEN, "You can only delete your own responses");
  }

  // Check if request is still open
  const request = await prisma.request.findUnique({
    where: { id: existing.requestId },
    select: { status: true },
  });

  if (request?.status !== RequestStatus.OPEN) {
    throw new AppError(status.BAD_REQUEST, "Cannot delete response for a non-open request");
  }

  return responseRepository.delete(id);
};

export const responseServices = {
  createResponse,
  getResponses,
  getMyResponses,
  getResponseById,
  updateResponse,
  deleteResponse,
};
