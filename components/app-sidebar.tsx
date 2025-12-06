"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    Users,
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
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r bg-card min-h-screen flex flex-col hidden md:flex">
            <div className="p-6 border-b flex items-center justify-center">
                <h2 className="font-bold text-xl tracking-tight">Gestión</h2>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {sidebarItems.map((item) => {
                    const isActive = item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
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
