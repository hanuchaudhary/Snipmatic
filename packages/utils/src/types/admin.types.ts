import { z } from "zod";

export const adminRoleSchema = z.enum(["USER", "ADMIN"]);
export const adminPlanTierSchema = z.enum(["STARTER", "INFLUENCER", "STUDIO"]);
export const adminProjectStatusSchema = z.enum([
  "QUEUED",
  "DOWNLOADING",
  "PREPROCESSING",
  "TRANSCRIBING",
  "DIARIZING",
  "DETECTING_FACES",
  "TRACKING",
  "ANALYZING",
  "FINDING_CLIPS",
  "COMPLETED",
  "FAILED",
]);
export const adminProcessingTypeSchema = z.enum(["AI", "MANUAL"]);
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
    projects: z.object({
      total: z.number(),
      completed: z.number(),
      failed: z.number(),
      processing: z.number(),
      creditsConsumed: z.number(),
      byStatus: z.array(
        z.object({
          status: adminProjectStatusSchema,
          count: z.number(),
        })
      ),
      bySource: z.array(
        z.object({
          source: adminVideoSourceSchema,
          count: z.number(),
        })
      ),
      byProcessingType: z.array(
        z.object({
          processingType: adminProcessingTypeSchema,
          count: z.number(),
        })
      ),
    }),
    activity: z.array(
      z.object({
        date: z.string(),
        projects: z.number(),
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

  projectsQuery: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    q: z.string().optional(),
    status: adminProjectStatusSchema.optional(),
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
        projectCount: z.number(),
      })
    ),
  }),

  projectsResponse: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    projects: z.array(
      z.object({
        id: z.string(),
        status: adminProjectStatusSchema,
        progress: z.number(),
        title: z.string().nullable(),
        source: adminVideoSourceSchema,
        clipCount: z.number(),
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
