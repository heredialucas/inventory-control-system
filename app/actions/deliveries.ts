"use server";

import { deliveryService } from "@/services/delivery-service";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { DeliveryStatus } from "@prisma/client";

export async function getDeliveries(filters?: {
    status?: DeliveryStatus;
    institutionId?: string;
    warehouseId?: string;
}) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "deliveries.view")) {
        return [];
    }

    try {
        return await deliveryService.getDeliveries(filters);
    } catch (error) {
        console.error("Error getting deliveries:", error);
        throw new Error("Failed to fetch deliveries");
    }
}

export async function getDelivery(id: string) {
    try {
        return await deliveryService.getDelivery(id);
    } catch (error) {
        console.error("Error getting delivery:", error);
        throw new Error("Failed to fetch delivery");
    }
}

export async function createDelivery(data: {
    institutionId: string;
    warehouseId: string;
    createdById: string;
    deliveryDate?: Date;
    receivedBy?: string;
    notes?: string;
    items: Array<{
        productId: string;
        quantity: number;
    }>;
}) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "deliveries.manage")) {
        throw new Error("No tienes permisos para crear entregas");
    }

    try {
        const delivery = await deliveryService.createDelivery(data);
        revalidatePath("/dashboard/deliveries");
        return delivery;
    } catch (error: any) {
        console.error("Error creating delivery:", error);
        throw new Error(error.message || "Failed to create delivery");
    }
}

export async function confirmDelivery(id: string) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "deliveries.manage")) {
        throw new Error("No tienes permisos para confirmar entregas");
    }

    try {
        const delivery = await deliveryService.confirmDelivery(id);
        revalidatePath("/dashboard/deliveries");
        revalidatePath(`/dashboard/deliveries/${id}`);
        return delivery;
    } catch (error: any) {
        console.error("Error confirming delivery:", error);
        throw new Error(error.message || "Failed to confirm delivery");
    }
}

export async function markAsDelivered(deliveryId: string, userId: string) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "deliveries.manage")) {
        throw new Error("No tienes permisos para marcar entregas como entregadas");
    }

    try {
        const delivery = await deliveryService.markAsDelivered(deliveryId, userId);
        revalidatePath("/dashboard/deliveries");
        revalidatePath(`/dashboard/deliveries/${deliveryId}`);
        return delivery;
    } catch (error: any) {
        console.error("Error marking delivery as delivered:", error);
        throw new Error(error.message || "Failed to mark delivery as delivered");
    }
}

export async function cancelDelivery(id: string) {
    try {
        const delivery = await deliveryService.cancelDelivery(id);
        revalidatePath("/dashboard/deliveries");
        revalidatePath(`/dashboard/deliveries/${id}`);
        return delivery;
    } catch (error: any) {
        console.error("Error cancelling delivery:", error);
        throw new Error(error.message || "Failed to cancel delivery");
    }
}

export async function getDeliveryStats() {
    try {
        return await deliveryService.getDeliveryStats();
    } catch (error) {
        console.error("Error getting delivery stats:", error);
        throw new Error("Failed to fetch delivery statistics");
    }
}
