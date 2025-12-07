import { getCurrentUser, hasPermission } from "@/lib/auth";
import { getWarehouses } from "@/app/actions/warehouses";
import { WarehouseList } from "@/components/warehouses/warehouse-list";
import { WarehouseForm } from "@/components/warehouses/warehouse-form";
import { UnauthorizedAccess } from "@/components/unauthorized-access";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

export const metadata = {
    title: "Warehouses | Inventory Control",
    description: "Manage warehouse locations and inventory distribution",
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Warehouses</h1>
                    <p className="text-muted-foreground">
                        Manage warehouse locations and inventory distribution
                    </p>
                </div>
                {canManage && (
                    <WarehouseForm
                        trigger={
                            <Button>
                                <Package className="mr-2 h-4 w-4" />
                                Add Warehouse
                            </Button>
                        }
                    />
                )}
            </div>

            <WarehouseList warehouses={warehouses} canManage={canManage} />
        </div>
    );
}
