import { getCurrentUser, hasPermission } from "@/lib/auth";
import { getPurchaseOrders } from "@/app/actions/purchases";
import { getWarehouses } from "@/app/actions/warehouses";
import { getExpedientes } from "@/app/actions/expedientes";
import { getSuppliers } from "@/app/actions/suppliers";
import { inventoryService } from "@/services/inventory-service";
import { ReceiptForm } from "@/components/receipts/receipt-form";
import { UnauthorizedAccess } from "@/components/unauthorized-access";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Cargar Remito | Control de Inventario",
    description: "Cargar remito de recepción de mercadería",
};

export default async function NewReceiptPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    if (!hasPermission(user, "receipts.manage")) {
        return <UnauthorizedAccess action="cargar" resource="remitos" />;
    }

    const [allOrders, rawProducts, warehouses, categories, expedientes, suppliers] = await Promise.all([
        getPurchaseOrders(),
        inventoryService.getProducts(),
        getWarehouses(),
        inventoryService.getCategories(),
        getExpedientes(),
        getSuppliers(),
    ]);

    const products = rawProducts.map(p => ({
        ...p,
        price: Number(p.price)
    }));

    const receivableOrders = allOrders.filter(o => 
        o.status === "PENDING" || o.status === "PARTIAL"
    );

    return (
        <div className="space-y-6">
            <ReceiptForm 
                purchaseOrders={receivableOrders} 
                products={products}
                warehouses={warehouses}
                categories={categories}
                expedientes={expedientes}
                suppliers={suppliers}
                userId={user.id} 
            />
        </div>
    );
}
