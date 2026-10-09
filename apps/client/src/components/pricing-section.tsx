import React from "react";
import { useNavigate } from "react-router";
import { IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/auth.client";
import { PaymentApi } from "@/lib/api/payment";
import { PLAN_TIERS, PLANS, type PlanTier } from "@snipmatic/utils";
import { cn } from "@/lib/utils";

export default function PricingSection() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const [loadingTier, setLoadingTier] = React.useState<PlanTier | null>(null);

  const handleCheckout = async (planTier: PlanTier) => {
    if (!session?.user) {
      navigate("/signup");
      return;
    }

    setLoadingTier(planTier);

    try {
      const { url } = await PaymentApi.checkout({ planTier });
      window.location.href = url;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to start checkout. Please try again."
      );
      setLoadingTier(null);
    }
  };

  return (
    <div className="w-full px-8 pt-16 pb-20">
      <h2 className="md:text-2xl">Pricing</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Monthly plans. Credits refresh each billing cycle.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {PLAN_TIERS.map((tier) => {
          const plan = PLANS[tier];
          const isLoading = loadingTier === tier;

          return (
            <div
              key={tier}
              className={cn(
                "flex flex-col gap-6 rounded-2xl border p-6",
                plan.highlighted && "border-foreground/20 bg-muted/30"
              )}
            >
              <div>
                <p className="text-sm text-muted-foreground">{plan.name}</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-light">${plan.price}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.monthlyCredits.toLocaleString()} credits
                </p>
              </div>

              <ul className="space-y-2 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="text-foreground/40">·</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="mt-auto w-full rounded-full"
                variant={plan.highlighted ? "default" : "secondary"}
                onClick={() => handleCheckout(tier)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <IconLoader2 className="animate-spin" />
                    Redirecting
                  </>
                ) : (
                  "Subscribe"
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
