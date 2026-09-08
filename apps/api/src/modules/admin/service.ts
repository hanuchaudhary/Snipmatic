import {
  type PlanTier,
  type ProjectStatus,
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
  projects: { createdAt: Date }[],
  users: { createdAt: Date }[]
) => {
  const days: AdminModel["overviewResponse"]["activity"] = [];
  const projectCounts = new Map<string, number>();
  const userCounts = new Map<string, number>();

  for (const project of projects) {
    const key = toDay(project.createdAt);
    projectCounts.set(key, (projectCounts.get(key) ?? 0) + 1);
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
      projects: projectCounts.get(key) ?? 0,
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
      projectTotals,
      creditsConsumed,
      projectsByStatus,
      projectsBySource,
      clipsByProcessingType,
      recentProjects,
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
      prisma.project.aggregate({
        _count: { _all: true },
      }),
      prisma.creditUsage.aggregate({
        _sum: { amount: true },
      }),
      prisma.project.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.project.groupBy({
        by: ["source"],
        _count: { _all: true },
      }),
      prisma.clip.groupBy({
        by: ["processingType"],
        _count: { _all: true },
      }),
      prisma.project.findMany({
        where: { createdAt: { gte: activitySince } },
        select: { createdAt: true },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: activitySince } },
        select: { createdAt: true },
      }),
    ]);

    const statusCounts = new Map<ProjectStatus, number>(
      projectsByStatus.map((row) => [row.status, row._count._all])
    );
    const completed = statusCounts.get("COMPLETED") ?? 0;
    const failed = statusCounts.get("FAILED") ?? 0;
    const totalProjects = projectTotals._count._all;

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
      projects: {
        total: totalProjects,
        completed,
        failed,
        processing: totalProjects - completed - failed,
        creditsConsumed: creditsConsumed._sum.amount ?? 0,
        byStatus: projectsByStatus.map((row) => ({
          status: row.status,
          count: row._count._all,
        })),
        bySource: projectsBySource.map((row) => ({
          source: row.source,
          count: row._count._all,
        })),
        byProcessingType: clipsByProcessingType.map((row) => ({
          processingType: row.processingType,
          count: row._count._all,
        })),
      },
      activity: fillActivity(activitySince, recentProjects, recentUsers),
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
            select: { projects: true },
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
        projectCount: user._count.projects,
      })),
    };
  }

  static async projects(
    query: AdminModel["projectsQuery"]
  ): Promise<AdminModel["projectsResponse"]> {
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

    const [total, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
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
          error: true,
          createdAt: true,
          _count: {
            select: { clips: true },
          },
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
      projects: projects.map((project) => ({
        id: project.id,
        status: project.status,
        progress: project.progress,
        title: project.title,
        source: project.source,
        clipCount: project._count.clips,
        error: project.error,
        createdAt: project.createdAt,
        user: project.user,
      })),
    };
  }
}
