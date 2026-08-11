import { PlanTier as DbPlanTier } from "@snipmatic/db";
import type { PlanTier } from "@snipmatic/utils";

export const planTierToDb = (planTier: PlanTier): DbPlanTier => {
  switch (planTier) {
    case "starter":
      return DbPlanTier.STARTER;
    case "influencer":
      return DbPlanTier.INFLUENCER;
    case "studio":
      return DbPlanTier.STUDIO;
  }
};

export const planTierFromDb = (planTier: DbPlanTier): PlanTier => {
  switch (planTier) {
    case DbPlanTier.STARTER:
      return "starter";
    case DbPlanTier.INFLUENCER:
      return "influencer";
    case DbPlanTier.STUDIO:
      return "studio";
  }
};
