import type { Metadata } from "next";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AppSidebar } from "@/components/app-sidebar";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Dashboard - Inventory Control System",
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex text-foreground bg-background">
            <AppSidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex h-16 items-center justify-between px-4 md:px-6">
                        <div className="md:hidden font-bold">Gestión</div> {/* Mobile header placeholder */}
                        <div className="ml-auto flex items-center gap-4">
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
