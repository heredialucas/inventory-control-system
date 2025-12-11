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

interface SidebarItem {
    title: string;
    href: string;
    icon: any;
    permission?: string;
    requiresAdmin?: boolean; // Para items que solo el admin puede ver
}

const sidebarItems: SidebarItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        requiresAdmin: true, // Solo admin puede ver el dashboard
    },
    {
        title: "Usuarios",
        href: "/dashboard/users",
        icon: Users,
        permission: "users.view",
    },
    {
        title: "Inventario",
        href: "/dashboard/inventory",
        icon: Package,
        permission: "inventory.view",
    },
    {
        title: "Categorías",
        href: "/dashboard/categories",
        icon: Layers,
        permission: "categories.view",
    },
    {
        title: "Depósitos",
        href: "/dashboard/warehouses",
        icon: Warehouse,
        permission: "warehouses.view",
    },
    {
        title: "Transferencias",
        href: "/dashboard/warehouses/transfers",
        icon: ArrowRightLeft,
        permission: "warehouses.view",
    },
    {
        title: "Proveedores",
        href: "/dashboard/suppliers",
        icon: Users,
        permission: "suppliers.view",
    },
    {
        title: "Compras",
        href: "/dashboard/purchases",
        icon: ShoppingCart,
        permission: "purchases.view",
    },
    {
        title: "Instituciones",
        href: "/dashboard/institutions",
        icon: Building2,
        permission: "institutions.view",
    },
    {
        title: "Entregas",
        href: "/dashboard/deliveries",
        icon: Truck,
        permission: "deliveries.view",
    },
    {
        title: "Reportes",
        href: "/dashboard/reports",
        icon: BarChart3,
        permission: "reports.view",
    },
    {
        title: "Movimientos",
        href: "/dashboard/movements",
        icon: Activity,
        permission: "movements.view",
    },
];

export function AppSidebar({ 
    className, 
    onNavigate,
    userPermissions = [],
    isAdmin = false,
}: { 
    className?: string; 
    onNavigate?: () => void;
    userPermissions?: string[];
    isAdmin?: boolean;
}) {
    const pathname = usePathname();

    // Filtrar items según permisos del usuario
    const filteredItems = sidebarItems.filter(item => {
        // Si requiere ser admin, verificar que lo sea
        if (item.requiresAdmin) return isAdmin;
        // Si no requiere permiso, mostrarlo
        if (!item.permission) return true;
        // Si requiere permiso, verificar que el usuario lo tenga
        return userPermissions.includes(item.permission);
    });

    return (
        <aside className={cn("w-64 bg-card flex flex-col", className)}>
            <div className="p-6 border-b flex items-center justify-center">
                <h2 className="font-bold text-xl tracking-tight">Gestión</h2>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {filteredItems.map((item) => {
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
