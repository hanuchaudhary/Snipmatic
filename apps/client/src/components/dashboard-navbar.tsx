import { Link, useLocation } from "react-router";

import { IconCrownFilled } from "@tabler/icons-react";

import { SidebarTrigger } from "@/components/ui/sidebar";

const PAGE_TITLES: { match: string; title: string; }[] = [
  {
    match: "/dashboard",
    title: "Dashboard",
  },
  {
    match: "/clips",
    title: "Clips",
  },
  {
    match: "/admin",
    title: "Admin",
  },
  {
    match: "/profile",
    title: "Profile",
  },
  {
    match: "/settings",
    title: "Settings",
  },
  {
    match: "/pricing/success",
    title: "Subscription",
  },
  {
    match: "/pricing/cancel",
    title: "Checkout",
  },
  {
    match: "/pricing/error",
    title: "Checkout",
  },
];

const resolveTitle = (pathname: string) =>
  PAGE_TITLES.find((page) => pathname.startsWith(page.match)) ?? {
    title: "Dashboard",
    subtitle: "Create clips and track processing",
  };

export function DashboardNavbar() {
  const { pathname } = useLocation();
  const { title } = resolveTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 px-6 bg-background">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium leading-none">{title}</p>
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
      </div>
    </header>
  );
}
