import { prisma } from "@/app/lib/prisma";
import type { TokenPayload } from "@/app/types";
import AppError from "@/app/utils/app-error.util";
import { paginationUtils } from "@/app/utils/pagination.util";
import { tokenUtils } from "@/app/utils/token.util";
import { parseSchema } from "@/app/utils/zod-error.util";
import type { Organization } from "@/generated/prisma/client";
import { UserStatus, UserType, UserTypeStatus } from "@/generated/prisma/enums";
import type { UserWhereInput } from "@/generated/prisma/models";
import status from "http-status";
import type { OnboardingPayload } from "./user.validation";
import { userListQuerySchema } from "./user.validation";

const onboarding = async (userId: string, payload: OnboardingPayload) => {
  if (!payload.types || payload.types.length === 0) {
    throw new AppError(status.BAD_REQUEST, "Select at least one type");
  }

  const orgData = payload.types.includes(UserType.ORGANIZATION)
    ? {
        userId,
        orgName: payload.orgName ?? "",
        description: payload.description ?? "",
        logoUrl: payload.logoUrl ?? null,
        website: payload.website ?? null,
        registrationNumber: payload.registrationNumber ?? null,
        contactEmail: payload.contactEmail ?? null,
        contactPhone: payload.contactPhone ?? null,
      }
    : null;

  let organization: Organization | null = null;

  const userTypeEntries = await prisma.$transaction(async (tx) => {
    const entries = [];

    for (const type of payload.types) {
      const statusValue = type === UserType.DONOR ? UserTypeStatus.ACTIVE : UserTypeStatus.PENDING;

      const entry = await tx.userTypeEntry.upsert({
        where: { userId_type: { userId, type } },
        update: { status: statusValue },
        create: { userId, type, status: statusValue },
      });

      entries.push(entry);

      if (type === UserType.ORGANIZATION && orgData) {
        organization = await tx.organization.upsert({
          where: { userId },
          update: orgData,
          create: orgData,
        });
      }
    }

    return entries;
  });

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId, status: UserStatus.ACTIVE },
    include: { userTypes: true },
  });

  const tokenPayload: TokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    userTypes: user.userTypes.map((ut) => ({ type: ut.type, status: ut.status })),
  };

  const accessToken = tokenUtils.generateAccessToken(tokenPayload);
  const refreshToken = tokenUtils.generateRefreshToken(tokenPayload);

  return organization
    ? { accessToken, refreshToken, userTypeEntries, organization }
    : { accessToken, refreshToken, userTypeEntries };
};

const getAllUsers = async (query: unknown) => {
  const typedQuery = parseSchema(userListQuerySchema, query);
  const { page, limit, skip, take } = paginationUtils.getPaginationOptions(typedQuery);

  const where: UserWhereInput = {};

  if (typedQuery.role) {
    const roles = Array.isArray(typedQuery.role) ? typedQuery.role : [typedQuery.role];
    where.role = { in: roles };
  }

  if (typedQuery.status) {
    const statuses = Array.isArray(typedQuery.status) ? typedQuery.status : [typedQuery.status];
    where.status = { in: statuses };
  }

  if (typedQuery.search) {
    where.OR = [
      {
        name: {
          contains: typedQuery.search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: typedQuery.search,
          mode: "insensitive",
        },
      },
      {
        phone: {
          contains: typedQuery.search,
          mode: "insensitive",
        },
      },
    ];
  }

  const orderBy = paginationUtils.getOrderBy(typedQuery.sortBy, typedQuery.sortOrder, [
    "name",
    "email",
    "createdAt",
    "updatedAt",
  ]);

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        userTypes: {
          select: {
            id: true,
            type: true,
            status: true,
          },
        },
        organization: {
          select: {
            orgName: true,
            description: true,
            contactEmail: true,
            contactPhone: true,
          },
        },
        _count: {
          select: {
            createdRequests: true,
            donations: true,
          },
        },
      },
    }),
  ]);

  return {
    data: users,
    meta: paginationUtils.getPaginationMeta(total, page, limit),
  };
};

const getUsersByType = async (userType: UserType, query: unknown) => {
  const typedQuery = parseSchema(userListQuerySchema, query);
  const { page, limit, skip, take } = paginationUtils.getPaginationOptions(typedQuery);

  const where: UserWhereInput = {
    userTypes: {
      some: {
        type: userType,
      },
    },
  };

  if (typedQuery.role) {
    const roles = Array.isArray(typedQuery.role) ? typedQuery.role : [typedQuery.role];
    where.role = { in: roles };
  }

  if (typedQuery.status) {
    const statuses = Array.isArray(typedQuery.status) ? typedQuery.status : [typedQuery.status];
    where.status = { in: statuses };
  }

  if (typedQuery.search) {
    where.OR = [
      {
        name: {
          contains: typedQuery.search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: typedQuery.search,
          mode: "insensitive",
        },
      },
      {
        phone: {
          contains: typedQuery.search,
          mode: "insensitive",
        },
      },
    ];
  }

  const orderBy = paginationUtils.getOrderBy(typedQuery.sortBy, typedQuery.sortOrder, [
    "name",
    "email",
    "createdAt",
    "updatedAt",
  ]);

  // Different count fields based on user type
  const countFields = {
    [UserType.DONOR]: {
      select: {
        createdRequests: true,
        donations: true,
      },
    },
    [UserType.VOLUNTEER]: {
      select: {
        createdRequests: true,
        donations: true,
        responses: true,
        volunteerAssignments: true,
      },
    },
    [UserType.ORGANIZATION]: {
      select: {
        createdRequests: true,
        donations: true,
        responses: true,
        volunteerAssignments: true,
        managedAssignments: true,
      },
    },
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        userTypes: {
          select: {
            id: true,
            type: true,
            status: true,
          },
        },
        organization: {
          select: {
            orgName: true,
            description: true,
            contactEmail: true,
            contactPhone: true,
          },
        },
        _count: countFields[userType],
      },
    }),
  ]);

  return {
    data: users,
    meta: paginationUtils.getPaginationMeta(total, page, limit),
  };
};

const getAllVolunteers = async (query: unknown) => {
  return getUsersByType(UserType.VOLUNTEER, query);
};

const getAllDonors = async (query: unknown) => {
  return getUsersByType(UserType.DONOR, query);
};

const getAllOrganizations = async (query: unknown) => {
  return getUsersByType(UserType.ORGANIZATION, query);
};

const updateUserTypeStatus = async (userTypeEntryId: string, newStatus: UserTypeStatus) => {
  const existUserTypeEntry = await prisma.userTypeEntry.findUnique({
    where: { id: userTypeEntryId },
  });

  if (!existUserTypeEntry) {
    throw new AppError(status.NOT_FOUND, "User type entry not found");
  }

  const updated = await prisma.userTypeEntry.update({
    where: { id: userTypeEntryId },
    data: { status: newStatus },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          userTypes: {
            select: {
              id: true,
              type: true,
              status: true,
            },
          },
        },
      },
    },
  });

  return updated;
};

export const userServices = {
  onboarding,
  getAllUsers,
  getAllVolunteers,
  getAllDonors,
  getAllOrganizations,
  updateUserTypeStatus,
};
