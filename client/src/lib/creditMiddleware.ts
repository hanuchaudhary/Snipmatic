import { prisma } from "./prisma";

export const CREDIT_PACKAGES = [
  { credits: 100, price: 5 },
  { credits: 200, price: 9 },
  { credits: 420, price: 17 },
  { credits: 1250, price: 40 },
  { credits: 2000, price: 75 },
];

interface CreditCosts {
  AI_CLIP: number;
  MANUAL_CLIP: number;
  MULTIPLE_CLIPS_ADDON: number;
  SUBTITLES_ADDON: number;
}

const CREDIT_COSTS: CreditCosts = {
  AI_CLIP: 10,              // 10 credits for 1 AI video clip
  MANUAL_CLIP: 5,           // 5 credits for 1 manual clip
  MULTIPLE_CLIPS_ADDON: 5,  // +5 credits for multiple clips
  SUBTITLES_ADDON: 5,       // +5 credits for subtitles
};

export function getCreditCosts(): CreditCosts {
  return CREDIT_COSTS;
}

export interface CreditRequirement {
  totalCreditsRequired: number;
  breakdown: {
    baseClip: number;
    multipleClips: number;
    subtitles: number;
  };
}

export function calculateCreditsRequired(
  clipType: "AI" | "MANUAL",
  multipleClips: boolean = false,
  subtitles: boolean = false
): CreditRequirement {
  const costs = getCreditCosts();
  
  const baseClip = clipType === "AI" ? costs.AI_CLIP : costs.MANUAL_CLIP;
  const multipleClipsAddon = multipleClips ? costs.MULTIPLE_CLIPS_ADDON : 0;
  const subtitlesAddon = subtitles ? costs.SUBTITLES_ADDON : 0;
  
  return {
    totalCreditsRequired: baseClip + multipleClipsAddon + subtitlesAddon,
    breakdown: {
      baseClip,
      multipleClips: multipleClipsAddon,
      subtitles: subtitlesAddon,
    },
  };
}

export const creditMiddleware = async (
  userId: string,
  clipType: "AI" | "MANUAL",
  multipleClips: boolean = false,
  subtitles: boolean = false
): Promise<{ canProceed: boolean; message?: string; creditsRequired?: number; currentCredits?: number }> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        credits: true,
      },
    });

    if (!user) {
      return {
        canProceed: false,
        message: "User not found",
      };
    }

    const creditRequirement = calculateCreditsRequired(clipType, multipleClips, subtitles);
    const currentCredits = user.credits;
    
    if (currentCredits < creditRequirement.totalCreditsRequired) {
      return {
        canProceed: false,
        message: `Insufficient credits. You need ${creditRequirement.totalCreditsRequired} credits but only have ${currentCredits}`,
        creditsRequired: creditRequirement.totalCreditsRequired,
        currentCredits,
      };
    }

    return {
      canProceed: true,
      creditsRequired: creditRequirement.totalCreditsRequired,
      currentCredits,
    };
  } catch (error) {
    console.error("Error in creditMiddleware:", error);
    return {
      canProceed: false,
      message: "Error checking credits",
    };
  }
};

export const deductCredits = async (
  userId: string,
  taskId: string,
  clipType: "AI" | "MANUAL",
  multipleClips: boolean = false,
  subtitles: boolean = false
): Promise<{ success: boolean; message?: string; remainingCredits?: number }> => {
  try {
    const creditRequirement = calculateCreditsRequired(clipType, multipleClips, subtitles);
    
    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Check current credits
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.credits < creditRequirement.totalCreditsRequired) {
        throw new Error(`Insufficient credits. Required: ${creditRequirement.totalCreditsRequired}, Available: ${user.credits}`);
      }

      // Deduct credits
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          credits: {
            decrement: creditRequirement.totalCreditsRequired,
          },
        },
        select: { credits: true },
      });

      // Record credit usage
      await tx.creditUsage.create({
        data: {
          userId,
          taskId,
          creditsUsed: creditRequirement.totalCreditsRequired,
          actionType: `${clipType}_CLIP${multipleClips ? "_MULTIPLE" : ""}${subtitles ? "_SUBTITLES" : ""}`,
          description: `${clipType} clip (${creditRequirement.breakdown.baseClip} credits)${
            multipleClips ? ` + Multiple clips (${creditRequirement.breakdown.multipleClips} credits)` : ""
          }${
            subtitles ? ` + Subtitles (${creditRequirement.breakdown.subtitles} credits)` : ""
          }`,
        },
      });

      return updatedUser.credits;
    });

    return {
      success: true,
      remainingCredits: result,
      message: `Successfully deducted ${creditRequirement.totalCreditsRequired} credits`,
    };
  } catch (error) {
    console.error("Error deducting credits:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error deducting credits",
    };
  }
};

export const addCredits = async (
  userId: string,
  credits: number,
  description: string = "Credits added"
): Promise<{ success: boolean; message?: string; newBalance?: number }> => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: credits,
        },
      },
      select: { credits: true },
    });

    return {
      success: true,
      newBalance: updatedUser.credits,
      message: `Successfully added ${credits} credits`,
    };
  } catch (error) {
    console.error("Error adding credits:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error adding credits",
    };
  }
};

export const getUserCredits = async (userId: string): Promise<number> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });
    
    return user?.credits || 0;
  } catch (error) {
    console.error("Error fetching user credits:", error);
    return 0;
  }
};
