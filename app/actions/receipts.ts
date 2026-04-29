"use server";

import { receiptService } from "@/services/receipt-service";
import { getCurrentUser, hasPermission } from "@/lib/auth";

async function verifyPermission(permission: string) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, permission)) {
        throw new Error("No tienes permisos para esta acción");
    }
}

export async function getReceipts(filters?: { expedienteId?: string; purchaseOrderId?: string }) {
    await verifyPermission("receipts.view");
    return receiptService.getReceipts(filters);
}

export async function getReceipt(id: string) {
    await verifyPermission("receipts.view");
    return receiptService.getReceipt(id);
}

export async function createReceipt(data: {
    purchaseOrderId?: string;
    warehouseId?: string;
    receiptNumber: string;
    date: Date;
    imageUrl?: string;
    userId: string;
    expedienteId?: string;
    supplierId?: string;
    items: Array<{
        itemId?: string;
        productId: string;
        quantity: number;
    }>;
}) {
    await verifyPermission("receipts.manage");
    return receiptService.createReceipt(data);
}

export async function updateReceipt(id: string, data: {
    receiptNumber?: string;
    date?: Date;
    imageUrl?: string;
    warehouseId?: string;
    expedienteId?: string;
    supplierId?: string;
    userId: string;
    items?: Array<{
        productId: string;
        quantity: number;
    }>;
}) {
    await verifyPermission("receipts.manage");
    return receiptService.updateReceipt(id, data);
}
