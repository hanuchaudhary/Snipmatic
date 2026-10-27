import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";

import { PLANS, type PaymentModel } from "@snipmatic/utils";
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconCalendarEvent,
  IconCreditCardFilled,
  IconExternalLinkFilled,
  IconPaletteFilled,
  IconRefresh,
  IconWallet,
} from "@tabler/icons-react";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { ThemeSwitch } from "@/components/theme-switch";
import { CreditUsageBars } from "@/components/credit-usage-bars";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LabelInput } from "@/components/ui/label-input";
import { PlasticButton } from "@/components/ui/plastic-button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaymentApi } from "@/lib/api/payment";
import { updateUser, useSession } from "@/lib/auth/auth.client";
import { AVATARS } from "@/lib/avatars";
import { cn } from "@/lib/utils";

type SettingsSection = "account" | "billing";
type AccountResponse = PaymentModel["accountResponse"];

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);

const formatActivityType = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

function PageHeading({ section }: { section: SettingsSection }) {
  return (
    <div className="mb-10">
      <h1 className="mt-2 heading">
        {section === "account" ? "Account" : "Billing"}
      </h1>
      <p className="mt-1 subheading text-[1.1rem]!">
        {section === "account"
          ? "Manage your profile and workspace preferences."
          : "Review your plan, subscription, and credit activity."}
      </p>
    </div>
  );
}

function AccountSettings() {
  const { data: session } = useSession();
  const user = session?.user;
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setImage(user.image ?? "");
    }
  }, [user]);

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter a name.");
      return;
    }

    setSaving(true);
    try {
      const result = await updateUser({ name: trimmed, image: image || null });
      if (result.error) {
        throw new Error(result.error.message || "Could not save profile");
      }
      toast.success("Profile updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save profile"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <section aria-labelledby="profile-heading" className="border-b pb-10">
        <div className="flex flex-wrap items-center gap-5">
          <Avatar className="size-20">
            <AvatarImage src={image} alt={name || "Your avatar"} />
            <AvatarFallback className="text-2xl">
              {name.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 id="profile-heading" className="font-medium">Choose an avatar</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick a character that feels like you.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-12">
          {AVATARS.map((avatar) => (
            <button
              key={avatar.name}
              type="button"
              onClick={() => setImage(avatar.url)}
              aria-label={`Choose ${avatar.name} avatar`}
              aria-pressed={image === avatar.url}
              className={cn(
                "relative aspect-square overflow-hidden rounded-2xl border-2 transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2",
                image === avatar.url ? "border-foreground" : "border-transparent"
              )}
            >
              <img src={avatar.url} alt="" loading="lazy" className="h-full w-full object-cover" />
              {image === avatar.url ? (
                <span className="absolute bottom-0 right-0 grid size-5 place-items-center rounded-tl-lg bg-foreground text-background">
                  <Check size={13} />
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <LabelInput
            label="Display name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
          />
          <LabelInput
            label="Email address"
            type="email"
            value={user?.email ?? ""}
            readOnly
            isDisabled
            disabled
          />
        </div>
        <div className="mt-7 flex justify-end">
          <PlasticButton onClick={() => void save()} disabled={saving || !user}>
            {saving ? "Saving…" : "Save changes"}
          </PlasticButton>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-5 py-8">
        <div className="flex items-center gap-4">
          <span className="grid size-11 place-items-center rounded-xl bg-secondary">
            <IconPaletteFilled size={20} />
          </span>
          <div>
            <h2 className="font-medium">Appearance</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a light or dark workspace.
            </p>
          </div>
        </div>
        <ThemeSwitch />
      </section>
    </>
  );
}

function BillingLoading() {
  return (
    <div className="space-y-4" aria-label="Loading billing details">
      <Skeleton className="h-72 w-full rounded-none" />
      <Skeleton className="h-72 w-full rounded-none" />
    </div>
  );
}

function BillingOverview({ account }: { account: AccountResponse }) {
  const [openingPortal, setOpeningPortal] = useState(false);
  const { billing } = account;
  const plan = PLANS[billing.planTier];
  const subscription = billing.subscription;
  const recentCreditsUsed = billing.recentActivity.reduce(
    (total, activity) => total + (activity.amount < 0 ? Math.abs(activity.amount) : 0),
    0
  );
  const trackedCredits = billing.balance + recentCreditsUsed;
  const usagePercentage = trackedCredits
    ? (recentCreditsUsed / trackedCredits) * 100
    : 0;

  const openBilling = async () => {
    setOpeningPortal(true);
    try {
      const { url } = await PaymentApi.createPortal();
      window.location.assign(url);
    } catch {
      toast.error("Unable to open billing. Please try again.");
      setOpeningPortal(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="overflow-hidden">
        <div className="gap-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-foreground text-background">
                <IconCreditCardFilled size={18} />
              </span>
              <div className="mt-1 flex items-center gap-2">
                <h2 className="text-2xl font-medium tracking-tight">{plan.name}</h2>
                <Badge variant={billing.planTier === "free" ? "secondary" : "default"}>
                  {subscription?.status ?? (billing.planTier === "free" ? "Free" : "Active")}
                </Badge>
              </div>
            </div>

            <p className="mt-6 max-w-md text-sm leading-6 text-muted-foreground">
              {billing.planTier === "free"
                ? "You are currently on the free plan. Upgrade when you need more monthly processing credits."
                : `${plan.monthlyCredits.toLocaleString()} credits are included with your plan each month.`}
            </p>

            <div className="mt-8 py-5">
              <div className="mb-1 flex items-center justify-between gap-4">
                <p className="text-sm font-medium">Credit usage</p>
                <p className="text-xs text-muted-foreground">
                  {recentCreditsUsed.toLocaleString()} of {trackedCredits.toLocaleString()} used
                </p>
              </div>
              <CreditUsageBars value={usagePercentage} />
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              {billing.hasBillingAccount ? (
                <PlasticButton onClick={() => void openBilling()} disabled={openingPortal}>
                  {openingPortal ? "Opening…" : "Manage billing"}
                  <IconExternalLinkFilled size={15} />
                </PlasticButton>
              ) : null}
              <Link to="/pricing">
                <PlasticButton variant={billing.hasBillingAccount ? "white" : "primary"}>
                  {billing.planTier === "free" ? "View plans" : "Compare plans"}
                </PlasticButton>
              </Link>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-px overflow-hidden border bg-border">
            <div className="bg-background p-4">
              <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                <IconWallet size={15} /> Available
              </dt>
              <dd className="mt-3 text-2xl font-medium tabular-nums">
                {billing.balance.toLocaleString()}
              </dd>
              <p className="mt-1 text-xs text-muted-foreground">credits</p>
            </div>
            <div className="bg-background p-4">
              <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                <IconArrowDownRight size={15} /> Recent usage
              </dt>
              <dd className="mt-3 text-2xl font-medium tabular-nums">
                {recentCreditsUsed.toLocaleString()}
              </dd>
              <p className="mt-1 text-xs text-muted-foreground">credits used</p>
            </div>
            <div className="col-span-2 bg-background p-4">
              <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                <IconCalendarEvent size={15} /> Billing schedule
              </dt>
              <dd className="mt-2 text-sm font-medium">
                {subscription
                  ? `${formatMoney(subscription.amount, subscription.currency)} · next billing ${formatDate(subscription.nextBillingDate)}`
                  : "No recurring subscription"}
              </dd>
              {subscription?.cancelAtPeriodEnd ? (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  Cancels at the end of this billing period.
                </p>
              ) : null}
            </div>
          </dl>
        </div>
      </section>

      <section aria-labelledby="credit-activity-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 id="credit-activity-heading" className="text-lg font-medium">Credit activity</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your latest grants, adjustments, and processing usage.
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            Balance {billing.balance.toLocaleString()}
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="h-11 pl-5">Activity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="pr-5 text-right">Credits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billing.recentActivity.length ? (
                billing.recentActivity.map((activity) => {
                  const isCredit = activity.amount > 0;
                  return (
                    <TableRow key={activity.id}>
                      <TableCell className="py-3 pl-5">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "grid size-8 place-items-center rounded-full",
                              isCredit
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-red-500/10 text-red-600 dark:text-red-400"
                            )}
                          >
                            {isCredit ? <IconArrowUpRight size={16} /> : <IconArrowDownRight size={16} />}
                          </span>
                          <div>
                            <p className="font-medium">
                              {activity.description || formatActivityType(activity.type)}
                            </p>
                            {activity.description ? (
                              <p className="mt-0.5 text-[11px] text-muted-foreground">
                                {formatActivityType(activity.type)}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(activity.createdAt)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "pr-5 text-right font-medium tabular-nums",
                          isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                        )}
                      >
                        {isCredit ? "+" : ""}{activity.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                    No credit activity yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

function BillingSettings() {
  const { data: session } = useSession();
  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["payment-account", session?.user?.id],
    queryFn: PaymentApi.getAccount,
    enabled: Boolean(session?.user),
  });

  if (isPending) return <BillingLoading />;

  if (isError || !data) {
    return (
      <div className="border border-dashed p-10 text-center">
        <IconCreditCardFilled className="mx-auto text-muted-foreground" size={28} />
        <h2 className="mt-4 font-medium">Billing details are unavailable</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          We could not load your plan and credit activity. Try refreshing this section.
        </p>
        <PlasticButton
          className="mx-auto mt-5"
          variant="white"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          <IconRefresh className={cn(isFetching && "animate-spin")} size={15} />
          {isFetching ? "Refreshing…" : "Try again"}
        </PlasticButton>
      </div>
    );
  }

  return <BillingOverview account={data} />;
}

export function SettingsPage({ section }: { section: SettingsSection }) {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-20 pt-10 md:px-10 md:pt-14">
      <PageHeading section={section} />
      {section === "account" ? <AccountSettings /> : <BillingSettings />}
    </main>
  );
}
