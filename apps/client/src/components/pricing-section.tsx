import React from "react";
import { useNavigate } from "react-router";
import { IconCheckFilled, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";

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
    <div className="w-full py-20">
      <div className="grid grid-cols-2">
        <h2 className="heading">Pricing</h2>
        <div>
          <p className="heading">
            <span>Monthly plans.</span>
            <br />
            <span className="text-muted-foreground">Credits refresh each billing cycle.</span>
          </p>
          <p className="subheading text-[1.2rem]! mt-4">
            Choose the plan that's right for you and get started today with 100 credits. Credits refresh each billing cycle.
          </p>
        </div>
      </div>
      <div className="grid gap-4 grid-cols-2 mt-20">
        {PLAN_TIERS.map((tier) => {
          const plan = PLANS[tier];
          const isLoading = loadingTier === tier;

          return (
            <div
              key={tier}
              className={cn(
                "flex flex-col gap-6 p-14 min-h-160 border",
                plan.highlighted && "bg-secondary/20 border-secondary/20"
              )}
            >
              <div>
                <p className="subheading text-[1.2rem]! text-primary!">{plan.name}</p>
                <div className="mt-6 flex items-baseline gap-1 heading">
                  <span className="text-4xl font-light">${plan.price}</span>
                  <span className="text-[1.2rem]! text-muted-foreground!">/month</span>
                </div>
                <p className="mt-2 subheading text-[1.2rem]! text-primary!">
                  {plan.monthlyCredits.toLocaleString()} credits
                </p>
              </div>

              <ul className="space-y-3 mt-6 subheading text-[1.2rem]! text-primary!">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <div className="size-7 flex items-center justify-center bg-emerald-800/30 rounded-full">
                      <IconCheckFilled className="w-4 h-4 text-emerald-500!" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className="mt-auto w-full rounded-full bg-primary px-6 py-3 text-primary-foreground"
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
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
