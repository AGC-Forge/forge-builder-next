import {
    Gauge,
    LayoutDashboard,
    ListTodo,
    type LucideIcon,
    SquareArrowUpRight,
    UserCog,
    Cog,
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
                url: "/dashboard/default",
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
                icon: ListTodo,
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
                title: "Account",
                url: "/dashboard/account",
                icon: UserCog,
            },
        ],
    },
    {
        id: 3,
        label: "Legacy",
        items: [
            {
                title: "Dashboards",
                url: "/dashboard/default-v1",
                subItems: [
                    { title: "Default V1", url: "/dashboard/default-v1" },
                    { title: "CRM V1", url: "/dashboard/crm-v1" },
                    { title: "Finance V1", url: "/dashboard/finance-v1" },
                ],
            },
        ],
    },
];