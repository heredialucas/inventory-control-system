import { getCurrentUser, hasPermission } from "@/lib/auth";
import { getPurchaseOrders } from "@/app/actions/purchases";
import { getReceipts } from "@/app/actions/receipts";
import { getWarehouses } from "@/app/actions/warehouses";
import { getExpedientes } from "@/app/actions/expedientes";
import { getSuppliers } from "@/app/actions/suppliers";
import { inventoryService } from "@/services/inventory-service";
import { receiptService } from "@/services/receipt-service";
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

    const [allOrders, rawProducts, warehouses, categories, expedientes, suppliers, receipts] = await Promise.all([
        getPurchaseOrders(),
        inventoryService.getAllProductsIncludingDeleted(),
        getWarehouses(),
        inventoryService.getCategories(),
        getExpedientes(),
        getSuppliers(),
        getReceipts(),
    ]);

    const products = rawProducts.map(p => ({
        ...p,
        price: Number(p.price)
    }));

    const receivableOrders = allOrders.filter(o => o.status !== "CANCELLED");

    const activeReceipts = receipts.filter(r => r.status === "ACTIVE");
    const existingReceiptNumbers = activeReceipts.reduce<Record<string, number>>((acc, r) => {
        acc[r.receiptNumber] = (acc[r.receiptNumber] || 0) + 1;
        return acc;
    }, {});

    const receiptNumbers = [...new Set(activeReceipts.map(r => r.receiptNumber))];
    const groupItemsMap = new Map<string, Array<{ productId: string; name: string; sku: string; quantity: number; price: number }>>();
    for (const num of receiptNumbers) {
        const items = await receiptService.getGroupItems(num);
        groupItemsMap.set(num, items);
    }

    const existingReceiptsData = activeReceipts.reduce<Record<string, { imageUrl?: string | null; expedienteId?: string | null; purchaseOrderId?: string | null; supplierId?: string | null; warehouseId?: string | null; items?: Array<{ productId: string; name: string; sku: string; quantity: number; price: number }> }>>((acc, r) => {
        if (!acc[r.receiptNumber]) {
            acc[r.receiptNumber] = {
                imageUrl: r.imageUrl,
                expedienteId: r.expedienteId,
                purchaseOrderId: r.purchaseOrderId,
                supplierId: r.supplierId,
                warehouseId: r.warehouseId,
                items: groupItemsMap.get(r.receiptNumber) || [],
            };
        }
        return acc;
    }, {});

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
                existingReceiptNumbers={existingReceiptNumbers}
                existingReceiptsData={existingReceiptsData}
            />
        </div>
    );
}
