import { Link, useLocation } from "react-router";

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
import { TooltipButton } from "./ui/tooltip-button";
import { ProfileDropdown } from "./ui/profile-dropdown";
import { Analytics01Icon, ClapperboardIcon, Crown03Icon, Home04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: Home04Icon,
  },
  {
    to: "/clips",
    label: "Clips",
    icon: ClapperboardIcon,
  },
  {
    to: "/pricing",
    label: "Pricing",
    icon: Crown03Icon,
  },
] as const;

export function AppSidebar() {
  const pathname = useLocation().pathname;
  const { open, setOpen } = useSidebar()
  const { data } = useSession()
  const isAdmin = data?.user.role === "ADMIN"

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <TooltipButton
          tooltipText={open ? "Close sidebar" : "Open sidebar"}
        >
          <button
            className="flex items-center cursor-pointer"
            onClick={() => setOpen(!open)}
          >
            <img src="/logo.png" className="size-12" alt="Snipmatic Logo" />
            <span className="text-lg font-jost group-data-[collapsible=icon]:hidden">Snipmatic</span>
          </button>
        </TooltipButton>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          < SidebarGroupLabel>
            Create
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ to, label, icon: Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton
                    className="text-[13px] font-normal!"
                    render={<Link to={to} />}
                    isActive={pathname === to}
                  >
                    <HugeiconsIcon
                      icon={Icon}
                      color="currentColor"
                    />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isAdmin ? (
          <SidebarGroup>
            <SidebarGroupLabel>
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="text-[13px] font-normal!"
                    render={<Link to="/admin" />}
                    isActive={pathname === "/admin"}
                  >
                    <HugeiconsIcon
                      icon={Analytics01Icon}
                      color="currentColor"
                    />
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
