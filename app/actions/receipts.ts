"use server";

import { receiptService } from "@/services/receipt-service";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
    const result = await receiptService.createReceipt(data);
    revalidatePath("/dashboard/receipts");
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/movements");
    if (data.purchaseOrderId) {
        revalidatePath(`/dashboard/purchases/${data.purchaseOrderId}`);
        revalidatePath("/dashboard/purchases");
    }
    if (data.expedienteId) {
        revalidatePath(`/dashboard/expedientes/${data.expedienteId}`);
    }
    return result;
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
    const result = await receiptService.updateReceipt(id, data);
    revalidatePath("/dashboard/receipts");
    revalidatePath(`/dashboard/receipts/${id}`);
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/movements");
    if (data.expedienteId) {
        revalidatePath(`/dashboard/expedientes/${data.expedienteId}`);
    }
    return result;
}
