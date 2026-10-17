import { Link, useLocation } from "react-router";

import {
  IconChartAreaLineFilled,
  IconCrownFilled,
  IconLayoutDashboardFilled,
  IconUserCircle,
  IconVideoFilled,
} from "@tabler/icons-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth/auth.client";

import { ProfileDropdown } from "./ui/profile-dropdown";
import { TooltipButton } from "./ui/tooltip-button";

const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: IconLayoutDashboardFilled,
  },
  {
    to: "/clips",
    label: "Clips",
    icon: IconVideoFilled,
  },
  {
    to: "/pricing",
    label: "Pricing",
    icon: IconCrownFilled,
  },
  {
    to: "/profile",
    label: "Profile",
    icon: IconUserCircle,
  },
] as const;

export function AppSidebar() {
  const pathname = useLocation().pathname;
  const { open, setOpen } = useSidebar();
  const { data } = useSession();
  const isAdmin = (data?.user as { role?: string } | undefined)?.role === "ADMIN";

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <TooltipButton tooltipText={open ? "Close sidebar" : "Open sidebar"}>
          <button
            className="flex items-center cursor-pointer"
            onClick={() => setOpen(!open)}
          >
            <img src="/logo.png" className="size-12" alt="Snipmatic Logo" />
            <span className="text-lg font-jost group-data-[collapsible=icon]:hidden">
              Snipmatic
            </span>
          </button>
        </TooltipButton>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Create</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ to, label, icon: Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton
                    className="text-[13px] font-normal!"
                    render={<Link to={to} />}
                    isActive={pathname === to}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isAdmin ? (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="text-[13px] font-normal!"
                    render={<Link to="/admin" />}
                    isActive={pathname === "/admin"}
                  >
                    <IconChartAreaLineFilled />
                    <span>Overview</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>
      <SidebarFooter>
        <ProfileDropdown />
      </SidebarFooter>
    </Sidebar>
  );
}
