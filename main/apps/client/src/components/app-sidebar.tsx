import { Link, useLocation } from "react-router";

import {
  IconScissors,
  IconSmartHome,
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
import { TooltipButton } from "./ui/tooltip-button";
import { ProfileDropdown } from "./ui/profile-dropdown";

const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: IconSmartHome,
  },
  {
    to: "/clips",
    label: "Clips",
    icon: IconScissors,
  },
] as const;

export function AppSidebar() {
  const pathname = useLocation().pathname;
  const { open, setOpen } = useSidebar()

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
                    className="text-[14px] font-normal!"
                    render={<Link to={to} />}
                    isActive={pathname === to}
                  >
                    <Icon className="stroke-1" />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <ProfileDropdown/>
      </SidebarFooter>
    </Sidebar>
  );
}
