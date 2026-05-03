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
                title: "Users",
                url: "/dashboard/users",
                icon: Users,
            },
        ],
    },
    {
        id: 2,
        label: "Settings",
        items: [
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