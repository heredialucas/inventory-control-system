import { getCurrentUser, hasPermission } from "@/lib/auth";
import { getSuppliers } from "@/app/actions/suppliers";
import { SupplierList } from "@/components/suppliers/supplier-list";
import { SupplierForm } from "@/components/suppliers/supplier-form";
import { UnauthorizedAccess } from "@/components/unauthorized-access";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export const metadata = {
    title: "Suppliers | Inventory Control",
    description: "Manage suppliers and vendors",
};

export default async function SuppliersPage() {
    const user = await getCurrentUser();

    if (!user || !hasPermission(user, "suppliers.view")) {
        return <UnauthorizedAccess action="ver" resource="proveedores" />;
    }

    const suppliers = await getSuppliers();
    const canManage = hasPermission(user, "suppliers.manage");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
                    <p className="text-muted-foreground">
                        Manage your suppliers and vendors
                    </p>
                </div>
                {canManage && (
                    <SupplierForm
                        trigger={
                            <Button>
                                <Users className="mr-2 h-4 w-4" />
                                Add Supplier
                            </Button>
                        }
                    />
                )}
            </div>

            <SupplierList suppliers={suppliers} />
        </div>
    );
}
