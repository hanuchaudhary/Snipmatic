import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

import { ArrowRight, Check, Clock3, RotateCcw, X } from "lucide-react";

import PricingSection from "@/components/pricing-section";
import { Button } from "@/components/ui/button";
import { PaymentApi } from "@/lib/api/payment";

import { Footer } from "./landing/footer";
import { Navbar } from "./landing/navbar";

export function PricingPage() {
  return (
    <main className="relative z-20 w-full">
      <Navbar />
      <div className="mx-auto max-w-7xl py-20">
        <PricingSection />
      </div>
    </main>
  );
}

type Outcome = "success" | "pending" | "cancelled" | "error";

const outcomeContent = {
  success: {
    eyebrow: "Subscription active",
    title: "You're all set.",
    description: "Your plan is active and your credits are ready to use.",
    icon: Check,
  },
  pending: {
    eyebrow: "Confirmation in progress",
    title: "Almost there.",
    description:
      "We are waiting for payment confirmation. Your plan and credits will update automatically when it arrives.",
    icon: Clock3,
  },
  cancelled: {
    eyebrow: "Checkout closed",
    title: "No changes made.",
    description:
      "Your checkout was cancelled. You can choose a plan whenever you're ready.",
    icon: X,
  },
  error: {
    eyebrow: "Checkout needs attention",
    title: "Something went wrong.",
    description:
      "We couldn't complete your checkout. Please try again, or check your account before starting another payment.",
    icon: X,
  },
} as const;

function OutcomePage({
  outcome,
  onRetry,
}: {
  outcome: Outcome;
  onRetry?: () => void;
}) {
  const content = outcomeContent[outcome];
  const Icon = content.icon;

  return (
    <div className="relative z-20 w-full">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 pb-20 pt-40 md:px-0">
        <div className="md:grid grid-cols-2">
          <h1 className="heading md:text-primary! text-muted-foreground!">
            Checkout
          </h1>
          <div>
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary/60 text-foreground">
              <Icon className="size-6" aria-hidden="true" />
            </span>
            <p className="subheading text-[1.2rem]! text-primary! mt-10">
              {content.eyebrow}
            </p>
            <p className="heading mt-4">
              {content.title}
              <br />
              <span className="text-muted-foreground">
                {outcome === "success"
                  ? "Start creating."
                  : outcome === "pending"
                    ? "We are checking."
                    : "You can try again."}
              </span>
            </p>
            <p className="subheading text-[1.2rem]! mt-8">
              {content.description}
            </p>
          </div>
        </div>

        <div className="md:mt-20 mt-10 border bg-secondary/20 p-10 md:p-14">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="heading">What’s next?</p>
              <p className="subheading text-[1.2rem]! mt-4">
                Your plan and credit activity are available from your profile.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              {outcome === "success" ? (
                <Button className="rounded-full" asChild>
                  <Link to="/dashboard">
                    Start creating <ArrowRight className="size-4" />
                  </Link>
                </Button>
              ) : outcome === "pending" ? (
                <Button
                  className="rounded-full"
                  onClick={onRetry}
                  disabled={!onRetry}
                >
                  <RotateCcw className="size-4" />{" "}
                  {onRetry ? "Check again" : "Checking..."}
                </Button>
              ) : (
                <Button className="rounded-full" asChild>
                  <Link to="/pricing">
                    View plans <ArrowRight className="size-4" />
                  </Link>
                </Button>
              )}
              <Button variant="outline" className="rounded-full" asChild>
                <Link to="/profile">View account</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function PricingSuccessPage() {
  const [params] = useSearchParams();
  const checkoutStatus = params.get("status");
  const [state, setState] = useState<"checking" | "active" | "pending">(
    "checking"
  );
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (checkoutStatus === "failed" || checkoutStatus === "cancelled") return;
    let stopped = false;
    let attempts = 0;
    let timer: number | undefined;

    const check = async () => {
      try {
        const account = await PaymentApi.getAccount();
        if (stopped) return;
        if (
          account.billing.planTier !== "free" &&
          account.billing.subscription?.status === "active"
        ) {
          setState("active");
          return;
        }
      } catch {
        if (stopped) return;
      }
      attempts += 1;
      if (attempts >= 10) {
        setState("pending");
      } else {
        timer = window.setTimeout(check, 3000);
      }
    };

    setState("checking");
    void check();
    return () => {
      stopped = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [checkoutStatus, retry]);

  if (checkoutStatus === "failed") return <PricingErrorPage />;
  if (checkoutStatus === "cancelled") return <PricingCancelPage />;
  if (state === "active") return <OutcomePage outcome="success" />;
  return (
    <OutcomePage
      outcome="pending"
      onRetry={
        state === "pending" ? () => setRetry((value) => value + 1) : undefined
      }
    />
  );
}

export function PricingCancelPage() {
  return <OutcomePage outcome="cancelled" />;
}

export function PricingErrorPage() {
  return <OutcomePage outcome="error" />;
}
