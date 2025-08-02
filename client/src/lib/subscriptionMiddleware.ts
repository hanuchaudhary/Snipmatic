import { prisma } from "./prisma";

interface SubscriptionLimits {
  VIDEO_LENGTH: number;
  AI_CLIP_COUNT: number;
  MANUAL_CLIP_COUNT: number;
  MULTIPLE_CLIPS: boolean;
  SUBTITLE: boolean;
}

const LIMITS: Record<"FREE_TIER" | "SNIPPER_TIER", SubscriptionLimits> = {
  FREE_TIER: {
    VIDEO_LENGTH: 10 * 60,
    AI_CLIP_COUNT: 1,
    MANUAL_CLIP_COUNT: 5,
    MULTIPLE_CLIPS: false,
    SUBTITLE: false,
  },
  SNIPPER_TIER: {
    VIDEO_LENGTH: Infinity,
    AI_CLIP_COUNT: 30,
    MANUAL_CLIP_COUNT: Infinity,
    MULTIPLE_CLIPS: true,
    SUBTITLE: true,
  },
};

export function getSubscriptionLimits(
  subscription: "FREE_TIER" | "SNIPPER_TIER"
): SubscriptionLimits {
  return LIMITS[subscription] || LIMITS.FREE_TIER;
}

export const subscriptionMiddleware = async (
  userId: string
): Promise<boolean> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscription: {
          select: {
            status: true,
          },
        },
        tasks: {
          select: {
            clipType: true,
            multipleClips: true,
            subtitle: true,
            duration: true,
            status: true,
          },
        },
      },
    });

    const tier: "FREE_TIER" | "SNIPPER_TIER" =
      user?.subscription?.status === "ACTIVE" ? "SNIPPER_TIER" : "FREE_TIER";

    const limits = getSubscriptionLimits(tier);
    const userTasks = user?.tasks || [];

    const manualClips = userTasks.filter(
      (task) => task.clipType === "MANUAL" && task.status !== "COMPLETED"
    );

    const aiClips = userTasks.filter(
      (task) => task.clipType === "AI" && task.status !== "COMPLETED"
    );

    const exceedsAICount = aiClips.length >= limits.AI_CLIP_COUNT;
    const exceedsManualCount = manualClips.length >= limits.MANUAL_CLIP_COUNT;
    const hasInvalidMultiClipsOrSubtitles = userTasks.some(
      (task) =>
        task.multipleClips !== limits.MULTIPLE_CLIPS ||
        task.subtitle !== limits.SUBTITLE
    );
    const exceedsVideoLength = userTasks.some(
      (task) => (task.duration ?? 0) > limits.VIDEO_LENGTH
    );

    const hasViolation =
      exceedsAICount ||
      exceedsManualCount ||
      hasInvalidMultiClipsOrSubtitles ||
      exceedsVideoLength;

    return hasViolation; 
  } catch (error) {
    console.error("Error in subscriptionMiddleware:", error);
    return true; 
  }
};
