"use server";

import { warehouseService } from "@/services/warehouse-service";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { TransferStatus } from "@prisma/client";

// ==================== WAREHOUSE CRUD ====================

export async function getWarehouses() {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "warehouses.view")) {
        throw new Error("No tienes permisos para ver depósitos");
    }

    try {
        return await warehouseService.getWarehouses();
    } catch (error) {
        console.error("Error getting warehouses:", error);
        throw new Error("Failed to fetch warehouses");
    }
}

export async function getWarehouse(id: string) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "warehouses.view")) {
        throw new Error("No tienes permisos para ver depósitos");
    }

    try {
        return await warehouseService.getWarehouse(id);
    } catch (error) {
        console.error("Error getting warehouse:", error);
        throw new Error("Failed to fetch warehouse");
    }
}

export async function createWarehouse(data: {
    name: string;
    code: string;
    description?: string;
    address?: string;
}) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "warehouses.manage")) {
        throw new Error("No tienes permisos para crear depósitos");
    }

    try {
        const warehouse = await warehouseService.createWarehouse(data);
        revalidatePath("/dashboard/warehouses");
        return warehouse;
    } catch (error: any) {
        console.error("Error creating warehouse:", error);
        if (error.code === "P2002") {
            throw new Error("Warehouse name or code already exists");
        }
        throw new Error("Failed to create warehouse");
    }
}

export async function updateWarehouse(
    id: string,
    data: {
        name?: string;
        code?: string;
        description?: string;
        address?: string;
    }
) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "warehouses.manage")) {
        throw new Error("No tienes permisos para editar depósitos");
    }

    try {
        const warehouse = await warehouseService.updateWarehouse(id, data);
        revalidatePath("/dashboard/warehouses");
        revalidatePath(`/dashboard/warehouses/${id}`);
        return warehouse;
    } catch (error: any) {
        console.error("Error updating warehouse:", error);
        if (error.code === "P2002") {
            throw new Error("Warehouse name or code already exists");
        }
        throw new Error("Failed to update warehouse");
    }
}

export async function toggleWarehouseStatus(id: string) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "warehouses.manage")) {
        throw new Error("No tienes permisos para cambiar estado de depósitos");
    }

    try {
        const warehouse = await warehouseService.toggleWarehouseStatus(id);
        revalidatePath("/dashboard/warehouses");
        revalidatePath(`/dashboard/warehouses/${id}`);
        return warehouse;
    } catch (error) {
        console.error("Error toggling warehouse status:", error);
        throw new Error("Failed to update warehouse status");
    }
}

export async function deleteWarehouse(id: string) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "warehouses.manage")) {
        throw new Error("No tienes permisos para eliminar depósitos");
    }

    try {
        await warehouseService.deleteWarehouse(id);
        revalidatePath("/dashboard/warehouses");
    } catch (error: any) {
        console.error("Error deleting warehouse:", error);
        throw new Error(error.message || "Failed to delete warehouse");
    }
}

// ==================== WAREHOUSE STOCK ====================

export async function getWarehouseStock(warehouseId: string) {
    try {
        return await warehouseService.getWarehouseStock(warehouseId);
    } catch (error) {
        console.error("Error getting warehouse stock:", error);
        throw new Error("Failed to fetch warehouse stock");
    }
}

export async function getProductStockByWarehouse(productId: string) {
    try {
        return await warehouseService.getProductStockByWarehouse(productId);
    } catch (error) {
        console.error("Error getting product stock by warehouse:", error);
        throw new Error("Failed to fetch product stock");
    }
}

// ==================== WAREHOUSE TRANSFERS ====================

export async function getTransfers(filters?: {
    status?: TransferStatus;
    warehouseId?: string;
    productId?: string;
}) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "transfers.view")) {
        throw new Error("No tienes permisos para ver transferencias");
    }

    try {
        return await warehouseService.getTransfers(filters);
    } catch (error) {
        console.error("Error getting transfers:", error);
        throw new Error("Failed to fetch transfers");
    }
}

export async function getTransfer(id: string) {
    try {
        return await warehouseService.getTransfer(id);
    } catch (error) {
        console.error("Error getting transfer:", error);
        throw new Error("Failed to fetch transfer");
    }
}

export async function createTransfer(data: {
    fromWarehouseId: string;
    toWarehouseId: string;
    productId: string;
    quantity: number;
    userId: string;
    notes?: string;
}) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "transfers.manage")) {
        throw new Error("No tienes permisos para crear transferencias");
    }

    try {
        const transfer = await warehouseService.createTransfer(data);
        revalidatePath("/dashboard/warehouses/transfers");
        revalidatePath(`/dashboard/warehouses/${data.fromWarehouseId}`);
        revalidatePath(`/dashboard/warehouses/${data.toWarehouseId}`);
        return transfer;
    } catch (error: any) {
        console.error("Error creating transfer:", error);
        throw new Error(error.message || "Failed to create transfer");
    }
}

export async function markTransferInTransit(transferId: string) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "transfers.manage")) {
        throw new Error("No tienes permisos para modificar transferencias");
    }

    try {
        const transfer = await warehouseService.markTransferInTransit(transferId);
        revalidatePath("/dashboard/warehouses/transfers");
        return transfer;
    } catch (error: any) {
        console.error("Error marking transfer in transit:", error);
        throw new Error(error.message || "Failed to update transfer");
    }
}

export async function completeTransfer(transferId: string, userId: string) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "transfers.manage")) {
        throw new Error("No tienes permisos para completar transferencias");
    }

    try {
        const transfer = await warehouseService.completeTransfer(transferId, userId);
        revalidatePath("/dashboard/warehouses/transfers");
        return transfer;
    } catch (error: any) {
        console.error("Error completing transfer:", error);
        throw new Error(error.message || "Failed to complete transfer");
    }
}

export async function cancelTransfer(transferId: string, userId: string) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "transfers.manage")) {
        throw new Error("No tienes permisos para cancelar transferencias");
    }

    try {
        const transfer = await warehouseService.cancelTransfer(transferId, userId);
        revalidatePath("/dashboard/warehouses/transfers");
        return transfer;
    } catch (error: any) {
        console.error("Error cancelling transfer:", error);
        throw new Error(error.message || "Failed to cancel transfer");
    }
}

// ==================== ANALYTICS ====================

export async function getLowStockItems(warehouseId: string) {
    try {
        return await warehouseService.getLowStockItems(warehouseId);
    } catch (error) {
        console.error("Error getting low stock items:", error);
        throw new Error("Failed to fetch low stock items");
    }
}

export async function getWarehouseStats(warehouseId: string) {
    try {
        return await warehouseService.getWarehouseStats(warehouseId);
    } catch (error) {
        console.error("Error getting warehouse stats:", error);
        throw new Error("Failed to fetch warehouse statistics");
    }
}
