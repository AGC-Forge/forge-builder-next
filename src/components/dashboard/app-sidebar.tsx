"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Command, HandHelping } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { NavSecondary } from "./nav-secondary";

const _data = {
  navSecondary: [
    {
      title: "Help",
      url: "/contact",
      icon: HandHelping,
    },
  ],
};

interface AppSidebarUser {
  name: string;
  email: string;
  avatar: string;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: AppSidebarUser;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const locale = useLocale();

  const { sidebarVariant, sidebarCollapsible, isSynced } = usePreferencesStore(
    useShallow((s) => ({
      sidebarVariant: s.sidebarVariant,
      sidebarCollapsible: s.sidebarCollapsible,
      isSynced: s.isSynced,
    })),
  );

  const variant = isSynced ? sidebarVariant : props.variant;
  const collapsible = isSynced ? sidebarCollapsible : props.collapsible;

  const navUser = user ?? {
    name: "User",
    email: "",
    avatar: "",
  };

  return (
    <Sidebar {...props} variant={variant} collapsible={collapsible}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link prefetch={false} href="/dashboard" locale={locale}>
                <Command />
                <span className="font-semibold text-base">SnapLand</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarItems} />
        <NavSecondary items={_data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
