import { getSuppliers } from "@/app/actions/suppliers";
import { getWarehouses } from "@/app/actions/warehouses";
import { getProducts } from "@/app/actions/inventory"; // Assuming this exists
import { getCurrentUser } from "@/lib/auth";
import { PurchaseOrderForm } from "@/components/purchases/purchase-form";
import { redirect } from "next/navigation";
import { getExpedientes } from "@/app/actions/expedientes";

export default async function NewPurchaseOrderPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const [suppliers, warehouses, products, expedientes] = await Promise.all([
        getSuppliers(),
        getWarehouses(),
        getProducts(),
        getExpedientes({ status: "ABIERTO" }),
    ]);

    // Filter active suppliers and warehouses (optional but good practice)
    const activeSuppliers = suppliers.filter(s => s.isActive);
    const activeWarehouses = warehouses.filter(w => w.isActive);

    return (
        <div className="space-y-6">
            <PurchaseOrderForm
                suppliers={activeSuppliers}
                warehouses={activeWarehouses}
                products={products}
                expedientes={expedientes}
                userId={user.id}
            />
        </div>
    );
}
