import {
  LayoutDashboard,
  Users,
  type LucideIcon,
  Package,
  Cog,
  Palette,
  KeyRound,
  Link,
  BarChart2,
  CircleUser,
  Activity,
  AppWindow,
  ShoppingCart,
  Crown,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}


export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboards",
    items: [
      {
        title: "Home",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: BarChart2,
      },
      {
        title: "Products",
        url: "/dashboard/products",
        icon: Package,
      },
      {
        title: "Landing Page",
        url: "/dashboard/landing-page",
        icon: Link,
      },
      {
        title: "Applications",
        url: "/dashboard/applications",
        icon: AppWindow,
        isNew: true
      },
      {
        title: "Orders",
        url: "/dashboard/orders",
        icon: ShoppingCart,
        isNew: true
      },
      {
        title: "Memberships",
        url: "/dashboard/memberships",
        icon: Crown,
        isNew: true
      },
      {
        title: "Users",
        url: "/dashboard/users",
        icon: Users,
      },
      {
        title: "Activity Log",
        url: "/dashboard/activity",
        icon: Activity,
      },
    ],
  },
  {
    id: 2,
    label: "Settings",
    items: [
      {
        title: "Profile",
        url: "/dashboard/settings/profile",
        icon: CircleUser,
      },
      {
        title: "Web Settings",
        url: "/dashboard/settings/web",
        icon: Cog,
      },
      {
        title: "Api Key",
        url: "/dashboard/settings/api-key",
        icon: KeyRound,
      },
      {
        title: "Appearance",
        url: "/dashboard/settings/appearance",
        icon: Palette,
      },
    ],
  },
];
