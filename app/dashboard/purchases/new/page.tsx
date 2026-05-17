import { getSuppliers } from "@/app/actions/suppliers";
import { getWarehouses } from "@/app/actions/warehouses";
import { getProducts } from "@/app/actions/inventory";
import { getCurrentUser } from "@/lib/auth";
import { PurchaseOrderForm } from "@/components/purchases/purchase-form";
import { redirect } from "next/navigation";
import { getExpedientes } from "@/app/actions/expedientes";
import { inventoryService } from "@/services/inventory-service";

export const metadata = {
    title: "Nueva Orden de Compra | Control de Inventario",
    description: "Crear nueva orden de compra a proveedor",
};

export default async function NewPurchaseOrderPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const [suppliers, warehouses, products, expedientes, categories] = await Promise.all([
        getSuppliers(),
        getWarehouses("DEPOSIT"),
        getProducts(),
        getExpedientes({ status: "ABIERTO" }),
        inventoryService.getCategories(),
    ]);

    const activeSuppliers = suppliers.filter(s => s.isActive);
    const activeWarehouses = warehouses.filter(w => w.isActive);

    return (
        <div className="space-y-6">
            <PurchaseOrderForm
                suppliers={activeSuppliers}
                warehouses={activeWarehouses}
                products={products}
                categories={categories}
                expedientes={expedientes}
                userId={user.id}
            />
        </div>
    );
}
