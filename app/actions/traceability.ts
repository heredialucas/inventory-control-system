"use server";

import { traceabilityService } from "@/services/traceability-service";

export async function getStockMovements(filters?: {
    productId?: string;
    warehouseId?: string;
    userId?: string;
    type?: "IN" | "OUT";
    startDate?: Date;
    endDate?: Date;
    reason?: string;
}) {
    try {
        return await traceabilityService.getStockMovements(filters);
    } catch (error) {
        console.error("Error getting stock movements:", error);
        throw new Error("Failed to fetch stock movements");
    }
}

export async function getProductHistory(productId: string) {
    try {
        return await traceabilityService.getProductHistory(productId);
    } catch (error) {
        console.error("Error getting product history:", error);
        throw new Error("Failed to fetch product history");
    }
}

export async function getWarehouseActivity(warehouseId: string, limit: number = 50) {
    try {
        return await traceabilityService.getWarehouseActivity(warehouseId, limit);
    } catch (error) {
        console.error("Error getting warehouse activity:", error);
        throw new Error("Failed to fetch warehouse activity");
    }
}

export async function getUserActivity(userId: string, limit: number = 50) {
    try {
        return await traceabilityService.getUserActivity(userId, limit);
    } catch (error) {
        console.error("Error getting user activity:", error);
        throw new Error("Failed to fetch user activity");
    }
}

export async function exportMovementsForAudit(filters?: {
    startDate?: Date;
    endDate?: Date;
    warehouseId?: string;
}) {
    try {
        return await traceabilityService.exportMovementsForAudit(filters);
    } catch (error) {
        console.error("Error exporting movements:", error);
        throw new Error("Failed to export movements for audit");
    }
}
