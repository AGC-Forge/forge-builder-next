import {
    Gauge,
    LayoutDashboard,
    Users,
    type LucideIcon,
    Package,
    Cog,
    Palette,
    KeyRound,
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
                icon: Gauge,
            },
            {
                title: "Products",
                url: "/dashboard/products",
                icon: Package,
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
                url: "/dashboard/web-settings",
                icon: Cog,
            },
            {
                title: "Appearance",
                url: "/dashboard/appearance",
                icon: Palette,
            },
            {
                title: "Api Key",
                url: "/dashboard/api-key",
                icon: KeyRound,
            },
        ],
    },
];