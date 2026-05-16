import { getCurrentUser, hasPermission } from "@/lib/auth";
import { getPurchaseOrders } from "@/app/actions/purchases";
import { getReceipts } from "@/app/actions/receipts";
import { getWarehouses } from "@/app/actions/warehouses";
import { getExpedientes } from "@/app/actions/expedientes";
import { getSuppliers } from "@/app/actions/suppliers";
import { getReceipt } from "@/app/actions/receipts";
import { inventoryService } from "@/services/inventory-service";
import { receiptService } from "@/services/receipt-service";
import { ReceiptForm } from "@/components/receipts/receipt-form";
import { UnauthorizedAccess } from "@/components/unauthorized-access";
import { notFound } from "next/navigation";

export default async function EditReceiptPage({ params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user || !hasPermission(user, "receipts.manage")) {
        return <UnauthorizedAccess action="editar" resource="remitos" />;
    }
    const authedUser = user;

    const [receipt, allOrders, rawProducts, warehouses, categories, expedientes, suppliers, receipts] = await Promise.all([
        getReceipt(id),
        getPurchaseOrders(),
        inventoryService.getProducts(),
        getWarehouses(),
        inventoryService.getCategories(),
        getExpedientes(),
        getSuppliers(),
        getReceipts(),
    ]);

    if (!receipt) notFound();

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

    // Always include current receipt's number so group items show even if it's COMPLETED
    const receiptNumbers = [...new Set([receipt.receiptNumber, ...activeReceipts.map(r => r.receiptNumber)])];
    const groupItemsMap = new Map<string, Array<{ productId: string; name: string; sku: string; quantity: number; price: number }>>();
    for (const num of receiptNumbers) {
        const items = await receiptService.getGroupItems(num);
        groupItemsMap.set(num, items);
    }

    const existingReceiptsData = [...activeReceipts, receipt].reduce<Record<string, { imageUrl?: string | null; expedienteId?: string | null; purchaseOrderId?: string | null; supplierId?: string | null; warehouseId?: string | null; items?: Array<{ productId: string; name: string; sku: string; quantity: number; price: number }> }>>((acc, r) => {
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
        <div className="container mx-auto py-6">
            <ReceiptForm 
                purchaseOrders={receivableOrders} 
                products={products}
                warehouses={warehouses}
                categories={categories}
                expedientes={expedientes}
                suppliers={suppliers}
                userId={authedUser.id} 
                initialData={receipt}
                existingReceiptNumbers={existingReceiptNumbers}
                existingReceiptsData={existingReceiptsData}
            />
        </div>
    );
}
