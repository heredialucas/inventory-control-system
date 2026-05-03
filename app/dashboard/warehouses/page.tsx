import { getCurrentUser, hasPermission } from "@/lib/auth";
import { getWarehouses } from "@/app/actions/warehouses";
import { WarehouseList } from "@/components/warehouses/warehouse-list";
import { WarehouseForm } from "@/components/warehouses/warehouse-form";
import { UnauthorizedAccess } from "@/components/unauthorized-access";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

export const metadata = {
    title: "Depósitos | Control de Inventario",
    description: "Gestionar ubicaciones de depósitos y distribución de inventario",
};

export default async function WarehousesPage() {
    const user = await getCurrentUser();

    if (!user || !hasPermission(user, "warehouses.view")) {
        return <UnauthorizedAccess action="ver" resource="depósitos" />;
    }

    const warehouses = await getWarehouses();
    const canManage = hasPermission(user, "warehouses.manage");

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Depósitos</h1>
                    <p className="text-muted-foreground text-sm">
                        Gestionar ubicaciones de depósitos y distribución de inventario
                    </p>
                </div>
                {canManage && (
                    <WarehouseForm
                        trigger={
                            <Button className="w-full sm:w-auto">
                                <Package className="mr-2 h-4 w-4" />
                                <span className="sm:hidden">Agregar</span>
                                <span className="hidden sm:inline">Agregar Depósito</span>
                            </Button>
                        }
                    />
                )}
            </div>

            <WarehouseList warehouses={warehouses} canManage={canManage} />
        </div>
    );
}
