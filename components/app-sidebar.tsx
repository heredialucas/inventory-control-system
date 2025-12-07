"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    Users,
    Warehouse,
    ArrowRightLeft,
    ShoppingCart,
    Building2,
    Truck,
    BarChart3,
    Activity,
    Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Usuarios",
        href: "/dashboard/users",
        icon: Users,
    },
    {
        title: "Inventario",
        href: "/dashboard/inventory",
        icon: Package,
    },
    {
        title: "Depósitos",
        href: "/dashboard/warehouses",
        icon: Warehouse,
    },
    {
        title: "Categorías",
        href: "/dashboard/categories",
        icon: Layers,
    },
    {
        title: "Transferencias",
        href: "/dashboard/warehouses/transfers",
        icon: ArrowRightLeft,
    },
    {
        title: "Proveedores",
        href: "/dashboard/suppliers",
        icon: Users,
    },
    {
        title: "Compras",
        href: "/dashboard/purchases",
        icon: ShoppingCart,
    },
    {
        title: "Instituciones",
        href: "/dashboard/institutions",
        icon: Building2,
    },
    {
        title: "Entregas",
        href: "/dashboard/deliveries",
        icon: Truck,
    },
    {
        title: "Reportes",
        href: "/dashboard/reports",
        icon: BarChart3,
    },
    {
        title: "Movimientos",
        href: "/dashboard/movements",
        icon: Activity,
    },
];

export function AppSidebar({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
    const pathname = usePathname();

    return (
        <aside className={cn("w-64 bg-card flex flex-col", className)}>
            <div className="p-6 border-b flex items-center justify-center">
                <h2 className="font-bold text-xl tracking-tight">Gestión</h2>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {sidebarItems.map((item) => {
                    // Exact match for dashboard home
                    if (item.href === "/dashboard") {
                        const isActive = pathname === "/dashboard";
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onNavigate}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-muted"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.title}</span>
                            </Link>
                        );
                    }

                    // For other routes, check if it's an exact match OR a child route
                    // But exclude cases where a longer route might match a shorter one
                    // (e.g., /warehouses/transfers shouldn't activate /warehouses)
                    const isExactMatch = pathname === item.href;
                    const isChildRoute = pathname.startsWith(`${item.href}/`) &&
                        !sidebarItems.some(otherItem =>
                            otherItem.href !== item.href &&
                            otherItem.href.startsWith(item.href) &&
                            pathname.startsWith(otherItem.href)
                        );
                    const isActive = isExactMatch || isChildRoute;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t text-xs text-center text-muted-foreground">
                v1.0.0
            </div>
        </aside>
    );
}
