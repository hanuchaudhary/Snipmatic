import { Link, useLocation } from "react-router";

import {
  IconChevronRight,
  IconChartAreaLineFilled,
  IconCrownFilled,
  IconCreditCardFilled,
  IconLayoutDashboardFilled,
  IconUserFilled,
  IconSettingsFilled,
  IconVideoFilled,
} from "@tabler/icons-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth/auth.client";

import { ProfileDropdown } from "./ui/profile-dropdown";

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
] as const;

const settingItems = [
  { to: "/settings/account", label: "Account", icon: IconUserFilled },
  { to: "/settings/billing", label: "Billing", icon: IconCreditCardFilled },
] as const;

export function AppSidebar() {
  const pathname = useLocation().pathname;
  const { state, isMobile, setOpenMobile } = useSidebar();
  const { data } = useSession();
  const isAdmin =
    (data?.user as { role?: string } | undefined)?.role === "ADMIN";
  const settingsActive = pathname.startsWith("/settings");
  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-none">
      <SidebarHeader>
        <div className="flex h-12 items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
          <Link
            to="/dashboard"
            onClick={closeMobile}
            className="flex min-w-0 items-center gap-2"
          >
            <img src="/logo.png" className="size-8 shrink-0" alt="Snipmatic Logo" />
            <span className="truncate text-lg font-medium tracking-tight group-data-[collapsible=icon]:hidden">Snipmatic</span>
          </Link>
          {isMobile || state === "expanded" ? (
            <SidebarTrigger className="shrink-0 group-data-[collapsible=icon]:hidden" />
          ) : null}
        </div>
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
                    render={<Link to={to} onClick={closeMobile} />}
                    isActive={pathname === to}
                    tooltip={label}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <Collapsible defaultOpen={settingsActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger
                    render={
                      <SidebarMenuButton
                        className="text-[13px] font-normal!"
                        isActive={settingsActive}
                        tooltip="Settings"
                      />
                    }
                  >
                    <IconSettingsFilled />
                    <span>Settings</span>
                    <IconChevronRight className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {settingItems.map(({ to, label, icon: Icon }) => (
                        <SidebarMenuSubItem key={to}>
                          <SidebarMenuSubButton
                            render={<Link to={to} onClick={closeMobile} />}
                            isActive={pathname === to}
                          >
                            <Icon />
                            <span>{label}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
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
                    tooltip="Admin overview"
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
