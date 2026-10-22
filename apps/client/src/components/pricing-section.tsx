import React from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
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
  const [openingPortal, setOpeningPortal] = React.useState(false);
  const { data: account, isPending: isAccountPending } = useQuery({
    queryKey: ["payment-account", session?.user?.id],
    queryFn: PaymentApi.getAccount,
    enabled: Boolean(session?.user),
  });
  const subscription = account?.billing.subscription;
  const hasSubscription = Boolean(subscription && subscription.status !== "cancelled" && subscription.status !== "expired");

  const handlePortal = async () => {
    setOpeningPortal(true);
    try {
      const { url } = await PaymentApi.createPortal();
      window.location.assign(url);
    } catch {
      toast.error("Unable to open billing. Please try again.");
      setOpeningPortal(false);
    }
  };

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
    <div className="w-full md:py-20 py-10 md:px-0 px-4">
      <div className="md:grid grid-cols-2">
        <h2 className="heading md:text-primary! text-muted-foreground!">Plans</h2>
        <div>
          <p className="heading">
            <span>Pick a pace that matches</span>
            <br />
            <span className="text-muted-foreground">how often you publish.</span>
          </p>
          <p className="subheading text-[1.2rem]! mt-4">
            Every plan includes the complete workflow. Processing uses one credit
            per video minute, with captions adding half a credit per minute.
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 grid-cols-1 md:gap-4 gap-2 md:mt-20 mt-10">
        {PLAN_TIERS.filter((tier) => tier !== "free").map((tier) => {
          const plan = PLANS[tier];
          const isLoading = loadingTier === tier;
          const isCurrent = hasSubscription && subscription?.planTier === tier;

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
                    <div className="size-7 flex items-center justify-center dark:bg-emerald-800/30 bg-emerald-300 rounded-full">
                      <IconCheckFilled className="w-4 h-4 text-emerald-500!" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className="mt-auto w-full rounded-full bg-primary px-6 py-3 text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => hasSubscription ? void handlePortal() : void handleCheckout(tier)}
                disabled={isLoading || openingPortal || (Boolean(session?.user) && isAccountPending)}
              >
                {Boolean(session?.user) && isAccountPending ? "Checking plan…" : isLoading || openingPortal ? (
                  <span className="flex items-center justify-center gap-2">
                    <IconLoader2 className="animate-spin" />
                    {openingPortal ? "Opening billing" : "Redirecting"}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {isCurrent ? "Manage current plan" : hasSubscription ? "Change plan in billing" : `Choose ${plan.name}`}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
