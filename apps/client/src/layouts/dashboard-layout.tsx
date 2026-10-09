import { Outlet, useLocation } from "react-router";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Navbar } from "@/pages/landing/navbar";

export function DashboardLayout() {
  const pathname = useLocation().pathname;

  return (
    <div className="h-svh overflow-hidden scrollbar-hidden bg-background w-full">
      <div className="flex h-full">
        <AppSidebar />
        <SidebarInset className="h-full min-h-0 overflow-y-auto scrollbar-hidden relative">
          <Navbar />
          <div
            className={cn(
              "w-full mx-auto",
              pathname.startsWith("/admin") ? "max-w-5xl" : "max-w-4xl"
            )}
          >
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </div>
  );
}
