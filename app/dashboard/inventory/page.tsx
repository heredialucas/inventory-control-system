import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getReceipts } from "@/app/actions/receipts";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UnauthorizedAccess } from "@/components/unauthorized-access";
import { ReceiptList } from "@/components/receipts/receipt-list";
import { Plus, FileText } from "lucide-react";

export default async function InventoryPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/auth/login");
    }

    if (!hasPermission(user, "receipts.view")) {
        return <UnauthorizedAccess action="ver" resource="ingresos" />;
    }

    const receipts = await getReceipts();
    const canManageReceipts = hasPermission(user, "receipts.manage");

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Ingresos</h1>
                    <p className="text-muted-foreground text-sm">
                        Gestión de remitos y stock de mercadería
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {canManageReceipts && (
                        <Button asChild className="w-full sm:w-auto">
                            <Link href="/dashboard/receipts/new">
                                <Plus className="mr-2 h-4 w-4" />
                                <span className="sm:hidden">Remito</span>
                                <span className="hidden sm:inline">Cargar Remito</span>
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                    <FileText className="h-5 w-5" />
                    <h2 className="text-xl font-semibold">Historial de Remitos</h2>
                </div>
                <ReceiptList receipts={receipts} canManage={canManageReceipts} />
            </div>
        </div>
    );
}