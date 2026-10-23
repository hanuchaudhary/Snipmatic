import { Link, useLocation } from "react-router";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { PlasticButton } from "./ui/plastic-button";

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
    match: "/settings/account",
    title: "Account",
  },
  {
    match: "/settings/billing",
    title: "Billing",
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
  const { state, isMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 pr-6 pl-2 bg-background">
      <div className="flex min-w-0 items-center gap-3">
        {isMobile || state === "collapsed" ? <SidebarTrigger /> : null}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium leading-none">{title}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/pricing"
        >
          <PlasticButton variant="blue">
            Upgrade
          </PlasticButton>
        </Link>
      </div>
    </header>
  );
}
