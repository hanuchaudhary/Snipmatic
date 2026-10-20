import { Link, useLocation } from "react-router";

import { IconCrownFilled } from "@tabler/icons-react";

import { ThemeSwitch } from "@/components/theme-switch";
import { SidebarTrigger } from "@/components/ui/sidebar";

const PAGE_TITLES: { match: string; title: string; subtitle: string }[] = [
  {
    match: "/dashboard",
    title: "Dashboard",
    subtitle: "Create clips and track processing",
  },
  {
    match: "/clips",
    title: "Clips",
    subtitle: "Everything you have generated",
  },
  {
    match: "/admin",
    title: "Admin",
    subtitle: "Users and projects overview",
  },
  {
    match: "/profile",
    title: "Profile",
    subtitle: "Account and subscription details",
  },
  {
    match: "/pricing/success",
    title: "Subscription",
    subtitle: "Confirming your plan",
  },
  {
    match: "/pricing/cancel",
    title: "Checkout",
    subtitle: "Your checkout was cancelled",
  },
  {
    match: "/pricing/error",
    title: "Checkout",
    subtitle: "Payment needs attention",
  },
];

const resolveTitle = (pathname: string) =>
  PAGE_TITLES.find((page) => pathname.startsWith(page.match)) ?? {
    title: "Dashboard",
    subtitle: "Create clips and track processing",
  };

export function DashboardNavbar() {
  const { pathname } = useLocation();
  const { title, subtitle } = resolveTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 px-6 bg-background">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium leading-none">{title}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/pricing"
          className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground sm:inline-flex"
        >
          <IconCrownFilled className="size-4" />
          Upgrade
        </Link>
        <ThemeSwitch />
      </div>
    </header>
  );
}
