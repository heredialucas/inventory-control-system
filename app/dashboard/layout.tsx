import type { Metadata } from "next";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AppSidebar } from "@/components/app-sidebar";
import { Suspense } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
    title: "Dashboard - Inventory Control System",
};

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();
    
    // Extraer todos los permisos del usuario
    const userPermissions: string[] = user?.userRoles?.flatMap(ur => 
        ur.role.permissions.map(rp => rp.permission.action)
    ) || [];

    // Verificar si el usuario es ADMIN
    const isAdmin = user?.userRoles?.some((ur: any) => ur.role.name === "ADMIN") || false;

    return (
        <div className="min-h-screen flex text-foreground bg-background">
            {/* Desktop Sidebar */}
            <AppSidebar 
                className="hidden md:flex border-r min-h-screen" 
                userPermissions={userPermissions}
                isAdmin={isAdmin}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex h-16 items-center gap-2 px-4 md:px-6">
                        {/* Mobile Navigation */}
                        <MobileNav userPermissions={userPermissions} isAdmin={isAdmin} />

                        {/* Desktop Empty Space */}
                        <div className="hidden md:block" />

                        <div className="ml-auto flex items-center gap-2 md:gap-4 shrink-0">
                            <Suspense fallback={<div className="h-8 w-8 animate-pulse bg-muted rounded" />}>
                                <AuthButton />
                            </Suspense>
                            <ThemeSwitcher />
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
