import { getCurrentUser, hasPermission } from "@/lib/auth";
import { getPurchaseOrders } from "@/app/actions/purchases";
import { getWarehouses } from "@/app/actions/warehouses";
import { getExpedientes } from "@/app/actions/expedientes";
import { getSuppliers } from "@/app/actions/suppliers";
import { getReceipt } from "@/app/actions/receipts";
import { inventoryService } from "@/services/inventory-service";
import { ReceiptForm } from "@/components/receipts/receipt-form";
import { UnauthorizedAccess } from "@/components/unauthorized-access";
import { notFound } from "next/navigation";

export default async function EditReceiptPage({ params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user || !hasPermission(user, "receipts.manage")) {
        return <UnauthorizedAccess action="editar" resource="remitos" />;
    }

    const [receipt, allOrders, rawProducts, warehouses, categories, expedientes, suppliers] = await Promise.all([
        getReceipt(id),
        getPurchaseOrders(),
        inventoryService.getProducts(),
        getWarehouses(),
        inventoryService.getCategories(),
        getExpedientes(),
        getSuppliers(),
    ]);

    if (!receipt) notFound();

    const products = rawProducts.map(p => ({
        ...p,
        price: Number(p.price)
    }));

    // Only orders that are draft or received, OR the one already linked
    const receivableOrders = allOrders.filter(o => 
        o.status === "DRAFT" || o.status === "RECEIVED" || o.id === receipt.purchaseOrderId
    );

    return (
        <div className="container mx-auto py-6">
            <ReceiptForm 
                purchaseOrders={receivableOrders} 
                products={products}
                warehouses={warehouses}
                categories={categories}
                expedientes={expedientes}
                suppliers={suppliers}
                userId={user.id} 
                initialData={receipt}
            />
        </div>
    );
}
