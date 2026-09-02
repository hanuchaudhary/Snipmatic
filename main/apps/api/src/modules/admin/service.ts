import {
  type PlanTier,
  type Status,
  prisma,
} from "@snipmatic/db";
import type { AdminModel } from "@snipmatic/utils/types";

const ACTIVITY_DAYS = 14;

const toDay = (date: Date) => date.toISOString().slice(0, 10);

const startOfDaysAgo = (days: number) => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - days);
  return date;
};

const fillActivity = (
  since: Date,
  jobs: { createdAt: Date }[],
  users: { createdAt: Date }[]
) => {
  const days: AdminModel["overviewResponse"]["activity"] = [];
  const jobCounts = new Map<string, number>();
  const userCounts = new Map<string, number>();

  for (const job of jobs) {
    const key = toDay(job.createdAt);
    jobCounts.set(key, (jobCounts.get(key) ?? 0) + 1);
  }

  for (const user of users) {
    const key = toDay(user.createdAt);
    userCounts.set(key, (userCounts.get(key) ?? 0) + 1);
  }

  for (let i = 0; i < ACTIVITY_DAYS; i++) {
    const date = new Date(since);
    date.setUTCDate(date.getUTCDate() + i);
    const key = toDay(date);
    days.push({
      date: key,
      jobs: jobCounts.get(key) ?? 0,
      users: userCounts.get(key) ?? 0,
    });
  }

  return days;
};

export abstract class AdminService {
  static async overview(): Promise<AdminModel["overviewResponse"]> {
    const now = new Date();
    const last7d = new Date(now);
    last7d.setUTCDate(last7d.getUTCDate() - 7);
    const last30d = new Date(now);
    last30d.setUTCDate(last30d.getUTCDate() - 30);
    const activitySince = startOfDaysAgo(ACTIVITY_DAYS - 1);

    const [
      totalUsers,
      adminUsers,
      usersLast7d,
      usersLast30d,
      billingByPlan,
      creditsInCirculation,
      creditTotals,
      jobTotals,
      jobsByStatus,
      jobsBySource,
      jobsByClipType,
      recentJobs,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { createdAt: { gte: last7d } } }),
      prisma.user.count({ where: { createdAt: { gte: last30d } } }),
      prisma.userBilling.groupBy({
        by: ["planTier"],
        _count: { _all: true },
      }),
      prisma.userBilling.aggregate({
        _sum: { creditsBalance: true },
      }),
      prisma.creditTransaction.groupBy({
        by: ["type"],
        _sum: { amount: true },
      }),
      prisma.job.aggregate({
        _count: { _all: true },
        _sum: { creditUsage: true },
      }),
      prisma.job.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.job.groupBy({
        by: ["source"],
        _count: { _all: true },
      }),
      prisma.job.groupBy({
        by: ["clipType"],
        _count: { _all: true },
      }),
      prisma.job.findMany({
        where: { createdAt: { gte: activitySince } },
        select: { createdAt: true },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: activitySince } },
        select: { createdAt: true },
      }),
    ]);

    const statusCounts = new Map<Status, number>(
      jobsByStatus.map((row) => [row.status, row._count._all])
    );
    const completed = statusCounts.get("COMPLETED") ?? 0;
    const failed = statusCounts.get("FAILED") ?? 0;
    const totalJobs = jobTotals._count._all;

    const granted =
      creditTotals.find((row) => row.type === "SUBSCRIPTION_GRANT")?._sum
        .amount ?? 0;
    const usedRaw =
      creditTotals.find((row) => row.type === "USAGE")?._sum.amount ?? 0;

    return {
      users: {
        total: totalUsers,
        admins: adminUsers,
        last7d: usersLast7d,
        last30d: usersLast30d,
      },
      billing: {
        byPlan: billingByPlan.map((row) => ({
          planTier: row.planTier as PlanTier,
          count: row._count._all,
        })),
        creditsInCirculation: creditsInCirculation._sum.creditsBalance ?? 0,
        creditsGranted: granted,
        creditsUsed: Math.abs(usedRaw),
      },
      jobs: {
        total: totalJobs,
        completed,
        failed,
        processing: totalJobs - completed - failed,
        creditsConsumed: jobTotals._sum.creditUsage ?? 0,
        byStatus: jobsByStatus.map((row) => ({
          status: row.status,
          count: row._count._all,
        })),
        bySource: jobsBySource.map((row) => ({
          source: row.source,
          count: row._count._all,
        })),
        byClipType: jobsByClipType.map((row) => ({
          clipType: row.clipType,
          count: row._count._all,
        })),
      },
      activity: fillActivity(activitySince, recentJobs, recentUsers),
    };
  }

  static async users(
    query: AdminModel["usersQuery"]
  ): Promise<AdminModel["usersResponse"]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const q = query.q?.trim();
    const where = q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" as const } },
            { name: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : undefined;

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          billing: {
            select: {
              planTier: true,
              creditsBalance: true,
            },
          },
          _count: {
            select: { jobs: true },
          },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        createdAt: user.createdAt,
        planTier: user.billing?.planTier ?? null,
        creditsBalance: user.billing?.creditsBalance ?? 0,
        jobCount: user._count.jobs,
      })),
    };
  }

  static async jobs(
    query: AdminModel["jobsQuery"]
  ): Promise<AdminModel["jobsResponse"]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const q = query.q?.trim();
    const where = {
      ...(query.status ? { status: query.status } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" as const } },
              {
                user: {
                  email: { contains: q, mode: "insensitive" as const },
                },
              },
              {
                user: {
                  name: { contains: q, mode: "insensitive" as const },
                },
              },
            ],
          }
        : {}),
    };

    const [total, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          progress: true,
          title: true,
          source: true,
          clipType: true,
          creditUsage: true,
          error: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      jobs,
    };
  }
}
