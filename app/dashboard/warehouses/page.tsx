import { getWarehouses } from "@/app/actions/warehouses";
import { WarehouseList } from "@/components/warehouses/warehouse-list";
import { WarehouseForm } from "@/components/warehouses/warehouse-form";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

export const metadata = {
    title: "Warehouses | Inventory Control",
    description: "Manage warehouse locations and inventory distribution",
};

export default async function WarehousesPage() {
    const warehouses = await getWarehouses();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Warehouses</h1>
                    <p className="text-muted-foreground">
                        Manage warehouse locations and inventory distribution
                    </p>
                </div>
                <WarehouseForm
                    trigger={
                        <Button>
                            <Package className="mr-2 h-4 w-4" />
                            Add Warehouse
                        </Button>
                    }
                />
            </div>

            <WarehouseList warehouses={warehouses} />
        </div>
    );
}
