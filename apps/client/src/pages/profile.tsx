import { useEffect, useState } from "react";
import { Link } from "react-router";

import type { PaymentModel } from "@snipmatic/utils";
import { PLANS } from "@snipmatic/utils";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PaymentApi } from "@/lib/api/payment";

type Account = PaymentModel["accountResponse"];

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));

const formatMoney = (amount: number, currency: string) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  });
  const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
  return formatter.format(amount / 10 ** digits);
};

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b py-4 last:border-0">
      <dt className="subheading text-[1rem]!">{label}</dt>
      <dd className="subheading text-[1rem]! text-primary!">{value}</dd>
    </div>
  );
}

export function ProfilePage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      setAccount(await PaymentApi.getAccount());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openPortal = async () => {
    setOpeningPortal(true);
    try {
      const { url } = await PaymentApi.createPortal();
      window.location.assign(url);
    } catch {
      toast.error("Unable to open billing. Please try again.");
      setOpeningPortal(false);
    }
  };

  if (loading) {
    return (
      <div
        className="space-y-5 px-6 py-10 md:px-10"
        aria-label="Loading profile"
      >
        <div className="h-28 animate-pulse bg-secondary/20" />
        <div className="h-56 animate-pulse bg-secondary/20" />
        <div className="h-56 animate-pulse bg-secondary/20" />
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="mx-6 my-12 border bg-secondary/20 p-10 md:mx-10">
        <h1 className="heading">Your account is unavailable.</h1>
        <p className="subheading mt-4 text-[1.2rem]!">
          We could not load your billing details right now.
        </p>
        <Button className="mt-6 rounded-full" onClick={() => void load()}>
          <RefreshCw className="size-4" /> Try again
        </Button>
      </div>
    );
  }

  const { user, billing } = account;
  const subscription = billing.subscription;
  const plan = PLANS[subscription?.planTier ?? billing.planTier];
  const initials = user.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="px-6 md:px-10">
      <section
        className="grid grid-cols-1 gap-2 md:mt-20 mt-10 md:grid-cols-2 md:gap-4"
        aria-label="Account summary"
      >
        <div className="flex min-h-64 flex-col justify-between border bg-secondary/20 p-10">
          <div className="flex size-12 items-center justify-center rounded-full bg-secondary/60">
            <Avatar className="size-12">
              {user.image ? (
                <AvatarImage src={user.image} alt={user.name} />
              ) : null}
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
          </div>
          <div className="mt-10">
            <h2 className="subheading text-primary!">{user.name}</h2>
            <p className="subheading text-[1.2rem]! mt-4">{user.email}</p>
          </div>
        </div>
        <div className="flex min-h-64 flex-col justify-between border bg-secondary/20 p-10">
          <span className="flex size-12 items-center justify-center rounded-full bg-secondary/60">
            <Wallet className="size-6" />
          </span>
          <div className="mt-10">
            <p className="subheading text-[1.2rem]! text-primary!">
              Available credits
            </p>
            <p className="heading mt-4 text-4xl!">
              {billing.balance.toLocaleString()}
            </p>
            <p className="subheading text-[1.2rem]! mt-4">
              Ready for your next project.
            </p>
          </div>
        </div>
      </section>

      <section
        className="grid grid-cols-1 gap-2 md:mt-4 mt-2 md:grid-cols-2 md:gap-4"
        aria-label="Subscription details"
      >
        <div className="border bg-secondary/20 p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="subheading text-[1.2rem]! text-primary!">
                Subscription
              </p>
              <h2 className="heading mt-4">{plan.name} plan</h2>
            </div>
            <span className="subheading text-[1rem]! capitalize">
              {subscription ? subscription.status.replaceAll("_", " ") : "Free"}
            </span>
          </div>
          <p className="subheading text-[1.2rem]! mt-6">
            {subscription
              ? subscription.status === "on_hold"
                ? "Your subscription is on hold. Open billing to update your payment method."
                : subscription.status === "paused"
                  ? "Your subscription is paused. Open billing to manage it."
                  : subscription.cancelAtPeriodEnd
                    ? "Your subscription is set to end at the close of this billing period."
                    : `${plan.monthlyCredits.toLocaleString()} credits are included each billing cycle.`
              : "Choose a monthly plan when you are ready for more credits."}
          </p>
          <dl className="mt-10 border-t">
            <Detail label="Plan" value={plan.name} />
            {subscription ? (
              <>
                <Detail label="Subscription ID" value={subscription.id} />
                <Detail
                  label="Started"
                  value={formatDate(subscription.startedAt)}
                />
                <Detail
                  label={
                    subscription.cancelAtPeriodEnd
                      ? "Ends on"
                      : "Next billing date"
                  }
                  value={formatDate(subscription.nextBillingDate)}
                />
                <Detail
                  label="Recurring price before tax"
                  value={formatMoney(
                    subscription.amount,
                    subscription.currency
                  )}
                />
              </>
            ) : null}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            {billing.hasBillingAccount ? (
              <Button
                className="rounded-full"
                onClick={() => void openPortal()}
                disabled={openingPortal}
              >
                <ExternalLink className="size-4" />{" "}
                {openingPortal ? "Opening…" : "Manage billing"}
              </Button>
            ) : null}
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/pricing">
                Explore plans <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="border bg-secondary/20 p-10">
          <p className="subheading text-[1.2rem]! text-primary!">
            Account details
          </p>
          <p className="subheading text-[1.2rem]! mt-4">
            Your Snipmatic account at a glance.
          </p>
          <dl className="mt-10 border-t">
            <Detail label="Member since" value={formatDate(user.createdAt)} />
            <Detail
              label="Role"
              value={user.role === "ADMIN" ? "Admin" : "Member"}
            />
            <Detail
              label="Email"
              value={user.emailVerified ? "Verified" : "Not verified"}
            />
            <Detail
              label="Billing"
              value={billing.hasBillingAccount ? "Connected" : "Not set up"}
            />
          </dl>
          <p className="subheading text-[1rem]! mt-8">
            Payment methods and invoices are available in the billing portal.
          </p>
        </div>
      </section>

      <section
        className="md:mt-4 mt-2 border bg-secondary/20 p-10"
        aria-label="Recent credit activity"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="heading">Recent activity</h2>
            <p className="subheading text-[1.2rem]! mt-4">
              A record of credits added and used.
            </p>
          </div>
        </div>
        <div className="mt-10 divide-y border-t">
          {billing.recentActivity.length ? (
            billing.recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    {item.amount >= 0 ? (
                      <ArrowDownLeft className="size-4" />
                    ) : (
                      <ArrowUpRight className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="subheading text-[1rem]! text-primary! truncate">
                      {item.description || item.type.replaceAll("_", " ")}
                    </p>
                    <p className="subheading text-[1rem]! mt-1">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>
                <span className="subheading text-[1rem]! text-primary! shrink-0 tabular-nums">
                  {item.amount > 0 ? "+" : ""}
                  {item.amount.toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p className="subheading text-[1.2rem]! py-8">
              No credit activity yet.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
