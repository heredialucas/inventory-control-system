import { getSuppliers } from "@/app/actions/suppliers";
import { SupplierList } from "@/components/suppliers/supplier-list";
import { SupplierForm } from "@/components/suppliers/supplier-form";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export const metadata = {
    title: "Suppliers | Inventory Control",
    description: "Manage suppliers and vendors",
};

export default async function SuppliersPage() {
    const suppliers = await getSuppliers();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
                    <p className="text-muted-foreground">
                        Manage your suppliers and vendors
                    </p>
                </div>
                <SupplierForm
                    trigger={
                        <Button>
                            <Users className="mr-2 h-4 w-4" />
                            Add Supplier
                        </Button>
                    }
                />
            </div>

            <SupplierList suppliers={suppliers} />
        </div>
    );
}
