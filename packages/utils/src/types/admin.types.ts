import { z } from "zod";

export const adminRoleSchema = z.enum(["USER", "ADMIN"]);
export const adminPlanTierSchema = z.enum(["STARTER", "INFLUENCER", "STUDIO"]);
export const adminJobStatusSchema = z.enum([
  "QUEUED",
  "DOWNLOADING",
  "PREPROCESSING",
  "TRANSCRIBING",
  "DIARIZING",
  "DETECTING_FACES",
  "TRACKING",
  "ANALYZING",
  "FINDING_CLIPS",
  "GENERATING_SUBTITLES",
  "GENERATING_CLIPS",
  "COMPLETED",
  "FAILED",
]);
export const adminClipTypeSchema = z.enum(["AI", "MANUAL"]);
export const adminVideoSourceSchema = z.enum(["YOUTUBE", "UPLOAD"]);

export const AdminModel = {
  overviewResponse: z.object({
    users: z.object({
      total: z.number(),
      admins: z.number(),
      last7d: z.number(),
      last30d: z.number(),
    }),
    billing: z.object({
      byPlan: z.array(
        z.object({
          planTier: adminPlanTierSchema,
          count: z.number(),
        })
      ),
      creditsInCirculation: z.number(),
      creditsGranted: z.number(),
      creditsUsed: z.number(),
    }),
    jobs: z.object({
      total: z.number(),
      completed: z.number(),
      failed: z.number(),
      processing: z.number(),
      creditsConsumed: z.number(),
      byStatus: z.array(
        z.object({
          status: adminJobStatusSchema,
          count: z.number(),
        })
      ),
      bySource: z.array(
        z.object({
          source: adminVideoSourceSchema,
          count: z.number(),
        })
      ),
      byClipType: z.array(
        z.object({
          clipType: adminClipTypeSchema,
          count: z.number(),
        })
      ),
    }),
    activity: z.array(
      z.object({
        date: z.string(),
        jobs: z.number(),
        users: z.number(),
      })
    ),
  }),

  listQuery: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    q: z.string().optional(),
  }),

  usersQuery: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    q: z.string().optional(),
  }),

  jobsQuery: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    q: z.string().optional(),
    status: adminJobStatusSchema.optional(),
  }),

  usersResponse: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    users: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        role: adminRoleSchema,
        image: z.string().nullable(),
        createdAt: z.coerce.date(),
        planTier: adminPlanTierSchema.nullable(),
        creditsBalance: z.number(),
        jobCount: z.number(),
      })
    ),
  }),

  jobsResponse: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    jobs: z.array(
      z.object({
        id: z.string(),
        status: adminJobStatusSchema,
        progress: z.number().nullable(),
        title: z.string().nullable(),
        source: adminVideoSourceSchema,
        clipType: adminClipTypeSchema,
        creditUsage: z.number(),
        error: z.string().nullable(),
        createdAt: z.coerce.date(),
        user: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
        }),
      })
    ),
  }),
} as const;

export type AdminModel = {
  [K in keyof typeof AdminModel]: z.infer<(typeof AdminModel)[K]>;
};
