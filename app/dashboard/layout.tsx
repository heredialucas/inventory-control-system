import type { Metadata } from "next";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";

export const metadata: Metadata = {
    title: "Dashboard - Inventory Control System",
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col">
            <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
                    <div className="font-semibold text-lg">Sistema de Gestión</div>
                    <div className="flex items-center gap-4">
                        <AuthButton />
                        <ThemeSwitcher />
                    </div>
                </div>
            </nav>
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6">
                {children}
            </main>
        </div>
    );
}
