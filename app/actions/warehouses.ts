"use server";

import { warehouseService } from "@/services/warehouse-service";
import { inventoryService } from "@/services/inventory-service";
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

export async function getWarehouseProducts(warehouseId: string) {
    try {
        if (warehouseId === "unassigned") {
            const products = await inventoryService.getProducts();
            return products.map(p => ({
                id: p.id,
                name: p.name,
                sku: p.sku,
                quantity: p.stock // Total stock
            }));
        }

        const stockItems = await warehouseService.getWarehouseStock(warehouseId);
        // Filter items with quantity > 0 and map to format
        return stockItems
            .filter(item => item.quantity > 0)
            .map(item => ({
                id: item.product.id,
                name: item.product.name,
                sku: item.product.sku,
                quantity: item.quantity
            }));
    } catch (error) {
        console.error("Error getting warehouse products:", error);
        throw new Error("Failed to fetch warehouse products");
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
        // 1. Fetch regular transfers
        const transfers = await warehouseService.getTransfers(filters);

        // 2. Map transfers to plain objects (serializing Decimals)
        const mappedTransfers = transfers.map(t => ({
            id: t.id,
            type: "TRANSFER" as const, // Discriminator for UI if needed
            quantity: t.quantity,
            status: t.status,
            notes: t.notes,
            createdAt: t.createdAt,
            completedAt: t.completedAt,
            fromWarehouse: {
                id: t.fromWarehouse.id,
                name: t.fromWarehouse.name,
                code: t.fromWarehouse.code,
            },
            toWarehouse: {
                id: t.toWarehouse.id,
                name: t.toWarehouse.name,
                code: t.toWarehouse.code,
            },
            product: {
                id: t.product.id,
                name: t.product.name,
                sku: t.product.sku,
                // price: t.product.price.toString(), // If price is needed, enable this. Currently UI doesn't seem to use it.
            },
            user: t.user,
        }));

        // 3. If we are showing "all" or filtering by destination warehouse, fetch "Ingresos" (Unassigned -> Warehouse)
        let stockMovements: any[] = [];

        if (!filters?.status || filters.status === "COMPLETED") {
            // Fetch "IN" movements that might be "Ingresos"
            // Strategy: valid "Ingresos" usually have a warehouseId (destination) but are not created by a transfer 
            // (though transfer completion also creates IN movements).
            // To distinguish: Transfer completion movements have reason "Transfer from warehouse completed".
            // We want "Transfer from Unassigned..." or similar, or just everything else?
            // Safest: Filter OUT those with reason "Transfer from warehouse completed".
            // Also filter by warehouseId if provided in filters.

            const movements = await inventoryService.getStockMovements({
                type: "IN",
                warehouseId: filters?.warehouseId,
                // We'll filter by reason manually since our service is simple
            });

            // Filter out movements that come from Transfer Completion (to avoid duplicates in the UI)
            // The reason string in `completeTransfer` is "Transfer from warehouse completed"
            // The reason string in `cancelTransfer` is "Transfer cancelled - stock returned" -> Should this show? Maybe as a cancelled return? 
            // Let's focus on "Ingresos" (Add Stock). 
            // `addStockToWarehouse` reason: data.notes || "Transfer from Unassigned/Adjustment"

            stockMovements = movements.filter(m =>
                m.reason !== "Transfer from warehouse completed" &&
                m.reason !== "Transfer cancelled - stock returned"
            );
        }

        const mappedMovements = stockMovements.map(m => ({
            id: m.id,
            type: "MOVEMENT" as const,
            quantity: m.quantity,
            status: "COMPLETED", // Movements are always done
            notes: m.reason,
            createdAt: m.createdAt,
            completedAt: m.createdAt, // Same
            fromWarehouse: {
                id: "unassigned",
                name: "Sin Asignar / Externo",
                code: "N/A"
            },
            toWarehouse: {
                id: m.warehouse?.id || "unknown",
                name: m.warehouse?.name || "Unknown",
                code: m.warehouse?.code || "??"
            },
            product: {
                id: m.product.id,
                name: m.product.name,
                sku: m.product.sku,
            },
            user: m.user,
        }));

        // 4. Merge and sort
        const combined = [...mappedTransfers, ...mappedMovements].sort((a, b) => { // Sort descending by date
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        });

        return combined;

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
        revalidatePath("/dashboard/warehouses"); // Update main list counts
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
        revalidatePath("/dashboard/warehouses"); // Update main list counts
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

export async function addStockToWarehouse(data: {
    warehouseId: string;
    productId: string;
    quantity: number;
    userId: string;
    notes?: string;
    isNewStock?: boolean;
}) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "transfers.manage")) {
        throw new Error("No tienes permisos para agregar stock");
    }

    try {
        // Distinguish between NEW STOCK (Purchase) and ASSIGNMENT (Distribution)

        // 1. Update Warehouse Stock (Always increases in target warehouse)
        await warehouseService.updateWarehouseStock(data.warehouseId, data.productId, data.quantity);

        if (data.isNewStock) {
            // NEW STOCK: Increases Total Product Stock
            await inventoryService.registerMovement({
                productId: data.productId,
                warehouseId: data.warehouseId,
                type: "IN",
                quantity: data.quantity,
                userId: data.userId,
                reason: data.notes || "Ingreso de Mercadería (Nuevo Stock)",
            });
        } else {
            // ASSIGNMENT: Does NOT increase Total Product Stock (moves from implicitly "Unassigned")
            await inventoryService.registerStockAssignment({
                productId: data.productId,
                warehouseId: data.warehouseId,
                quantity: data.quantity,
                userId: data.userId,
                reason: data.notes || "Asignación desde Sin Asignar",
            });
        }

        revalidatePath(`/dashboard/warehouses/${data.warehouseId}`);
        revalidatePath("/dashboard/warehouses/transfers");
        revalidatePath("/dashboard/warehouses");
        return { success: true };
    } catch (error: any) {
        console.error("Error adding stock:", error);
        throw new Error(error.message || "Failed to add stock");
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
