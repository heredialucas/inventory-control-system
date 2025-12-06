"use server";

import { purchaseService } from "@/services/purchase-service";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { PurchaseOrderStatus } from "@prisma/client";

export async function getPurchaseOrders(filters?: {
    status?: PurchaseOrderStatus;
    supplierId?: string;
    warehouseId?: string;
}) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "purchases.view")) {
        throw new Error("No tienes permisos para ver órdenes de compra");
    }

    try {
        return await purchaseService.getPurchaseOrders(filters);
    } catch (error) {
        console.error("Error getting purchase orders:", error);
        throw new Error("Failed to fetch purchase orders");
    }
}

export async function getPurchaseOrder(id: string) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "purchases.view")) {
        throw new Error("No tienes permisos para ver órdenes de compra");
    }

    try {
        return await purchaseService.getPurchaseOrder(id);
    } catch (error) {
        console.error("Error getting purchase order:", error);
        throw new Error("Failed to fetch purchase order");
    }
}

export async function createPurchaseOrder(data: {
    supplierId: string;
    warehouseId: string;
    createdById: string;
    expectedDate?: Date;
    notes?: string;
    items: Array<{
        productId: string;
        quantity: number;
        unitPrice: number;
    }>;
}) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "purchases.manage")) {
        throw new Error("No tienes permisos para crear órdenes de compra");
    }

    try {
        const order = await purchaseService.createPurchaseOrder(data);
        revalidatePath("/dashboard/purchases");
        return order;
    } catch (error: any) {
        console.error("Error creating purchase order:", error);
        throw new Error(error.message || "Failed to create purchase order");
    }
}

export async function updatePurchaseOrder(
    id: string,
    data: {
        expectedDate?: Date;
        notes?: string;
        status?: PurchaseOrderStatus;
    }
) {
    try {
        const order = await purchaseService.updatePurchaseOrder(id, data);
        revalidatePath("/dashboard/purchases");
        revalidatePath(`/dashboard/purchases/${id}`);
        return order;
    } catch (error: any) {
        console.error("Error updating purchase order:", error);
        throw new Error(error.message || "Failed to update purchase order");
    }
}

export async function receivePurchaseOrder(
    orderId: string,
    userId: string,
    receivedItems: Array<{
        itemId: string;
        quantity: number;
    }>
) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "purchases.manage")) {
        throw new Error("No tienes permisos para recibir órdenes de compra");
    }

    try {
        const order = await purchaseService.receivePurchaseOrder(
            orderId,
            userId,
            receivedItems
        );
        revalidatePath("/dashboard/purchases");
        revalidatePath(`/dashboard/purchases/${orderId}`);
        return order;
    } catch (error: any) {
        console.error("Error receiving purchase order:", error);
        throw new Error(error.message || "Failed to receive purchase order");
    }
}

export async function cancelPurchaseOrder(id: string) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "purchases.manage")) {
        throw new Error("No tienes permisos para cancelar órdenes de compra");
    }

    try {
        const order = await purchaseService.cancelPurchaseOrder(id);
        revalidatePath("/dashboard/purchases");
        revalidatePath(`/dashboard/purchases/${id}`);
        return order;
    } catch (error: any) {
        console.error("Error cancelling purchase order:", error);
        throw new Error(error.message || "Failed to cancel purchase order");
    }
}

export async function submitPurchaseOrder(id: string) {
    try {
        const order = await purchaseService.submitPurchaseOrder(id);
        revalidatePath("/dashboard/purchases");
        revalidatePath(`/dashboard/purchases/${id}`);
        return order;
    } catch (error: any) {
        console.error("Error submitting purchase order:", error);
        throw new Error(error.message || "Failed to submit purchase order");
    }
}

export async function getPurchaseStats() {
    try {
        return await purchaseService.getPurchaseStats();
    } catch (error) {
        console.error("Error getting purchase stats:", error);
        throw new Error("Failed to fetch purchase statistics");
    }
}
