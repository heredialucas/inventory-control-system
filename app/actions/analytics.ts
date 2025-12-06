"use server";

import { analyticsService } from "@/services/analytics-service";

export async function getDashboardStats() {
    try {
        return await analyticsService.getDashboardStats();
    } catch (error) {
        console.error("Error getting dashboard stats:", error);
        throw new Error("Failed to fetch dashboard statistics");
    }
}

export async function getStockByCategory() {
    try {
        return await analyticsService.getStockByCategory();
    } catch (error) {
        console.error("Error getting stock by category:", error);
        throw new Error("Failed to fetch stock by category");
    }
}

export async function getStockByWarehouse() {
    try {
        return await analyticsService.getStockByWarehouse();
    } catch (error) {
        console.error("Error getting stock by warehouse:", error);
        throw new Error("Failed to fetch stock by warehouse");
    }
}

export async function getMovementStats(days: number = 30) {
    try {
        return await analyticsService.getMovementStats(days);
    } catch (error) {
        console.error("Error getting movement stats:", error);
        throw new Error("Failed to fetch movement statistics");
    }
}

export async function getTopProductsByMovement(limit: number = 10, days: number = 30) {
    try {
        return await analyticsService.getTopProductsByMovement(limit, days);
    } catch (error) {
        console.error("Error getting top products:", error);
        throw new Error("Failed to fetch top products");
    }
}

export async function getLowStockProducts() {
    try {
        return await analyticsService.getLowStockProducts();
    } catch (error) {
        console.error("Error getting low stock products:", error);
        throw new Error("Failed to fetch low stock products");
    }
}

export async function getRecentActivity(limit: number = 10) {
    try {
        return await analyticsService.getRecentActivity(limit);
    } catch (error) {
        console.error("Error getting recent activity:", error);
        throw new Error("Failed to fetch recent activity");
    }
}
