import status from "http-status";
import {
  AssignmentStatus,
  CampaignStatus,
  DonationStatus,
  ResponseType,
  Role,
  UserType,
  UserTypeStatus,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import type { TokenPayload } from "../../types";
import AppError from "../../utils/app-error.util";

type AdminStats = Awaited<ReturnType<typeof getAdminStats>>;
type DonorStats = Awaited<ReturnType<typeof getDonorStats>>;
type VolunteerStats = Awaited<ReturnType<typeof getVolunteerStats>>;
type OrganizationStats = Awaited<ReturnType<typeof getOrganizationStats>>;
type UserStats = Awaited<ReturnType<typeof getUserStats>>;

type DashboardStats = {
  userStats?: UserStats;
  adminStats?: AdminStats;
  donorStats?: DonorStats;
  volunteerStats?: VolunteerStats;
  organizationStats?: OrganizationStats;
};

const getDashboardStatsData = async (user: TokenPayload): Promise<DashboardStats> => {
  try {
    const stats: DashboardStats = {};
    const tasks: Promise<any>[] = [];

    // All users get their personal stats (requests and received donations)
    tasks.push(
      getUserStats(user.id).then((data) => {
        stats.userStats = data;
      }),
    );

    if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
      tasks.push(
        getAdminStats().then((data) => {
          stats.adminStats = data;
        }),
      );
    }

    const activeTypes = user.userTypes
      .filter((ut) => ut.status === UserTypeStatus.ACTIVE)
      .map((ut) => ut.type);

    if (activeTypes.includes(UserType.VOLUNTEER)) {
      tasks.push(
        getVolunteerStats(user.id).then((data) => {
          stats.volunteerStats = data;
        }),
      );
    }

    if (activeTypes.includes(UserType.DONOR)) {
      tasks.push(
        getDonorStats(user.id).then((data) => {
          stats.donorStats = data;
        }),
      );
    }

    if (activeTypes.includes(UserType.ORGANIZATION)) {
      tasks.push(
        getOrganizationStats(user.id).then((data) => {
          stats.organizationStats = data;
        }),
      );
    }

    await Promise.all(tasks);

    return stats;
  } catch (error) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to fetch dashboard stats");
  }
};

const getAdminStats = async () => {
  const [
    userCount,
    requestCount,
    donationCount,
    campaignCount,
    organizationCount,
    assignmentCount,
    responseCount,
    messageCount,
    reviewCount,
    reportCount,
    notificationCount,
    verifiedOrgCount,
    totalDonationAmount,
    userTypeCounts,
    requestStatusDistribution,
    donationStatusDistribution,
    campaignStatusDistribution,
    requestCategoryDistribution,
    requestUrgencyDistribution,
    responseTypeDistribution,
    assignmentStatusDistribution,
    donationsOverTime,
    requestsOverTime,
    usersOverTime,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.request.count(),
    prisma.donation.count(),
    prisma.campaign.count(),
    prisma.organization.count(),
    prisma.assignment.count(),
    prisma.response.count(),
    prisma.message.count(),
    prisma.review.count(),
    prisma.report.count(),
    prisma.notification.count(),
    prisma.organization.count({ where: { isVerified: true } }),

    prisma.donation.aggregate({
      _sum: { amount: true },
      where: { status: DonationStatus.COMPLETED },
    }),

    prisma.userTypeEntry.groupBy({
      by: ["type"],
      _count: { id: true },
      where: { status: UserTypeStatus.ACTIVE },
    }),

    prisma.request.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.donation.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.campaign.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.request.groupBy({ by: ["category"], _count: { id: true } }),
    prisma.request.groupBy({ by: ["urgency"], _count: { id: true } }),
    prisma.response.groupBy({ by: ["responseType"], _count: { id: true } }),
    prisma.assignment.groupBy({ by: ["status"], _count: { id: true } }),

    getDonationsOverTime(),
    getRequestsOverTime(),
    getUsersOverTime(),
  ]);

  return {
    userCount,
    requestCount,
    donationCount,
    campaignCount,
    organizationCount,
    assignmentCount,
    responseCount,
    messageCount,
    reviewCount,
    reportCount,
    notificationCount,
    verifiedOrgCount,
    totalDonationAmount: totalDonationAmount._sum.amount ?? 0,

    userTypeCounts,
    requestStatusDistribution,
    donationStatusDistribution,
    campaignStatusDistribution,
    requestCategoryDistribution,
    requestUrgencyDistribution,
    responseTypeDistribution,
    assignmentStatusDistribution,

    donationsOverTime,
    requestsOverTime,
    usersOverTime,
  };
};

const getOrganizationStats = async (userId: string) => {
  const org = await prisma.organization.findUnique({
    where: { userId },
  });

  if (!org) {
    throw new AppError(status.NOT_FOUND, "Organization not found");
  }

  const [
    campaignCount,
    activeCampaignCount,
    completedCampaignCount,
    totalRaised,
    goalAmount,
    assignmentCount,
    completedAssignmentCount,
    donationCount,
    totalDonationAmount,
    campaignPerformance,
    recentDonations,
  ] = await Promise.all([
    prisma.campaign.count({ where: { orgId: org.id } }),
    prisma.campaign.count({
      where: { orgId: org.id, status: CampaignStatus.ACTIVE },
    }),
    prisma.campaign.count({
      where: { orgId: org.id, status: CampaignStatus.COMPLETED },
    }),

    prisma.campaign.aggregate({
      _sum: { currentAmount: true },
      where: { orgId: org.id },
    }),

    prisma.campaign.aggregate({
      _sum: { goalAmount: true },
      where: { orgId: org.id },
    }),

    prisma.assignment.count({ where: { organizationId: org.id } }),
    prisma.assignment.count({
      where: {
        organizationId: org.id,
        status: AssignmentStatus.COMPLETED,
      },
    }),

    prisma.donation.count({
      where: {
        campaign: { orgId: org.id },
        status: DonationStatus.COMPLETED,
      },
    }),

    prisma.donation.aggregate({
      _sum: { amount: true },
      where: {
        campaign: { orgId: org.id },
        status: DonationStatus.COMPLETED,
      },
    }),

    prisma.campaign.findMany({
      where: { orgId: org.id },
      select: {
        id: true,
        title: true,
        goalAmount: true,
        currentAmount: true,
        status: true,
        createdAt: true,
      },
    }),

    prisma.donation.findMany({
      where: { campaign: { orgId: org.id } },
      include: {
        donor: { select: { name: true, email: true } },
        request: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return {
    campaignCount,
    activeCampaignCount,
    completedCampaignCount,
    totalRaised: totalRaised._sum.currentAmount ?? 0,
    goalAmount: goalAmount._sum.goalAmount ?? 0,
    assignmentCount,
    completedAssignmentCount,
    donationCount,
    totalDonationAmount: totalDonationAmount._sum.amount ?? 0,
    campaignPerformance,
    recentDonations,
  };
};

const getVolunteerStats = async (userId: string) => {
  const [
    assignmentCount,
    completedAssignmentCount,
    inProgressAssignmentCount,
    responseCount,
    reviewCount,
    averageRating,
    recentAssignments,
    assignmentStatusDistribution,
  ] = await Promise.all([
    prisma.assignment.count({ where: { volunteerId: userId } }),
    prisma.assignment.count({
      where: { volunteerId: userId, status: AssignmentStatus.COMPLETED },
    }),
    prisma.assignment.count({
      where: { volunteerId: userId, status: AssignmentStatus.IN_PROGRESS },
    }),

    prisma.response.count({
      where: { userId, responseType: ResponseType.VOLUNTEER },
    }),

    prisma.review.count({ where: { targetUserId: userId } }),

    prisma.review.aggregate({
      _avg: { rating: true },
      where: { targetUserId: userId },
    }),

    prisma.assignment.findMany({
      where: { volunteerId: userId },
      include: {
        request: {
          select: { title: true, category: true, urgency: true },
        },
      },
      orderBy: { assignedAt: "desc" },
      take: 10,
    }),

    prisma.assignment.groupBy({
      by: ["status"],
      _count: { id: true },
      where: { volunteerId: userId },
    }),
  ]);

  return {
    assignmentCount,
    completedAssignmentCount,
    inProgressAssignmentCount,
    responseCount,
    reviewCount,
    averageRating: averageRating._avg.rating ?? 0,
    recentAssignments,
    assignmentStatusDistribution,
  };
};

const getDonorStats = async (userId: string) => {
  const [donationCount, totalDonated, responseCount, recentDonations, donationStatusDistribution] =
    await Promise.all([
      prisma.donation.count({
        where: { donorId: userId, status: DonationStatus.COMPLETED },
      }),

      prisma.donation.aggregate({
        _sum: { amount: true },
        where: { donorId: userId, status: DonationStatus.COMPLETED },
      }),

      prisma.response.count({
        where: { userId, responseType: ResponseType.DONATE },
      }),

      prisma.donation.findMany({
        where: { donorId: userId },
        include: {
          request: { select: { title: true, category: true } },
          campaign: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      prisma.donation.groupBy({
        by: ["status"],
        _count: { id: true },
        where: { donorId: userId },
      }),
    ]);

  return {
    donationCount,
    totalDonated: totalDonated._sum.amount ?? 0,
    responseCount,
    recentDonations,
    donationStatusDistribution,
  };
};

const getUserStats = async (userId: string) => {
  const [
    requestCount,
    activeRequestCount,
    completedRequestCount,
    receivedDonationCount,
    totalReceivedAmount,
    recentRequests,
    recentReceivedDonations,
    requestStatusDistribution,
  ] = await Promise.all([
    prisma.request.count({ where: { creator: { id: userId } } }),
    prisma.request.count({
      where: { creator: { id: userId }, status: { not: "COMPLETED" } },
    }),
    prisma.request.count({
      where: { creator: { id: userId }, status: "COMPLETED" },
    }),
    prisma.donation.count({
      where: {
        request: { creator: { id: userId } },
        status: DonationStatus.COMPLETED,
      },
    }),

    prisma.donation.aggregate({
      _sum: { amount: true },
      where: {
        request: { creator: { id: userId } },
        status: DonationStatus.COMPLETED,
      },
    }),

    prisma.request.findMany({
      where: { creator: { id: userId } },
      select: {
        id: true,
        title: true,
        category: true,
        urgency: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),

    prisma.donation.findMany({
      where: { request: { creator: { id: userId } } },
      include: {
        donor: { select: { name: true, email: true } },
        request: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),

    prisma.request.groupBy({
      by: ["status"],
      _count: { id: true },
      where: { creator: { id: userId } },
    }),
  ]);

  return {
    requestCount,
    activeRequestCount,
    completedRequestCount,
    receivedDonationCount,
    totalReceivedAmount: totalReceivedAmount._sum.amount ?? 0,
    recentRequests,
    recentReceivedDonations,
    requestStatusDistribution,
  };
};

const getDonationsOverTime = async () => {
  return prisma.$queryRaw`
    SELECT DATE_TRUNC('month', "created_at") AS month,
    COUNT(*)::int AS count,
    SUM(amount)::decimal AS amount
    FROM "donations"
    WHERE status = 'COMPLETED'
    GROUP BY month
    ORDER BY month ASC;
  `;
};

const getRequestsOverTime = async () => {
  return prisma.$queryRaw`
    SELECT DATE_TRUNC('month', "created_at") AS month,
    COUNT(*)::int AS count
    FROM "requests"
    GROUP BY month
    ORDER BY month ASC;
  `;
};

const getUsersOverTime = async () => {
  return prisma.$queryRaw`
    SELECT DATE_TRUNC('month', "createdAt") AS month,
    COUNT(*)::int AS count
    FROM "users"
    GROUP BY month
    ORDER BY month ASC;
  `;
};

export const StatsService = {
  getDashboardStatsData,
};
