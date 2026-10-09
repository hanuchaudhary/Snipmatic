import { PlanTier as DbPlanTier } from "@snipmatic/db";
import type { PlanTier } from "@snipmatic/utils";

export const planTierToDb = (planTier: PlanTier): DbPlanTier => {
  switch (planTier) {
    case "free":
      return DbPlanTier.FREE;
    case "clip":
      return DbPlanTier.CLIP;
    case "studio":
      return DbPlanTier.STUDIO;
  }
};

export const planTierFromDb = (planTier: DbPlanTier): PlanTier => {
  switch (planTier) {
    case DbPlanTier.FREE:
      return "free";
    case DbPlanTier.CLIP:
      return "clip";
    case DbPlanTier.STUDIO:
      return "studio";
  }
};
