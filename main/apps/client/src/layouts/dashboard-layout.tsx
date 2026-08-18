import { Outlet } from "react-router";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Navbar } from "@/pages/landing/navbar";

export function DashboardLayout() {
  return (
    <div className="h-svh overflow-hidden scrollbar-hidden bg-background w-full">
      <div className="flex h-full">
        <AppSidebar />
        <SidebarInset className="h-full min-h-0 overflow-y-auto scrollbar-hidden relative">
          <Navbar />
          <div className="w-full max-w-4xl mx-auto">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </div>
  );
}
