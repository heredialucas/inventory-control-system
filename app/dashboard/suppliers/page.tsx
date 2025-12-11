import { getCurrentUser, hasPermission } from "@/lib/auth";
import { getSuppliers } from "@/app/actions/suppliers";
import { SupplierList } from "@/components/suppliers/supplier-list";
import { SupplierForm } from "@/components/suppliers/supplier-form";
import { UnauthorizedAccess } from "@/components/unauthorized-access";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export const metadata = {
    title: "Proveedores | Control de Inventario",
    description: "Gestionar proveedores y vendedores",
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Proveedores</h1>
                    <p className="text-muted-foreground">
                        Gestionar proveedores y vendedores
                    </p>
                </div>
                {canManage && (
                    <div className="flex justify-end">
                        <SupplierForm
                            trigger={
                                <Button>
                                    <Users className="mr-2 h-4 w-4" />
                                    Agregar Proveedor
                                </Button>
                            }
                        />
                    </div>
                )}
            </div>

            <SupplierList suppliers={suppliers} canManage={canManage} />
        </div>
    );
}
