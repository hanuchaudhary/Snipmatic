import { Outlet } from "react-router";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Navbar } from "@/pages/landing/navbar";

export function DashboardLayout() {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen scrollbar-hidden bg-background w-full">
        <div className="flex">
          <AppSidebar />
          <SidebarInset className="min-h-[calc(100vh-5rem)] overflow-auto scrollbar-hidden relative ">
            <Navbar />
            <div className="w-full max-w-4xl mx-auto">
              <Outlet />
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
