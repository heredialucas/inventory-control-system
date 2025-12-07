import prisma from "@/lib/prisma";
import { Prisma, TransferStatus } from "@prisma/client";

export const warehouseService = {
    // ==================== WAREHOUSE CRUD ====================

    /**
     * Get all warehouses with stock summary
     */
    async getWarehouses() {
        return await prisma.warehouse.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: {
                        stockItems: true,
                        transfersFrom: true,
                        transfersTo: true,
                    },
                },
            },
        });
    },

    /**
     * Get a single warehouse with detailed information
     */
    async getWarehouse(id: string) {
        return await prisma.warehouse.findUnique({
            where: { id },
            include: {
                stockItems: {
                    include: {
                        product: {
                            include: {
                                category: true,
                            },
                        },
                    },
                    orderBy: {
                        product: {
                            name: "asc",
                        },
                    },
                },
                _count: {
                    select: {
                        transfersFrom: true,
                        transfersTo: true,
                        stockMovements: true,
                    },
                },
            },
        });
    },

    /**
     * Create a new warehouse
     */
    async createWarehouse(data: {
        name: string;
        code: string;
        description?: string;
        address?: string;
    }) {
        return await prisma.warehouse.create({
            data,
        });
    },

    /**
     * Update warehouse information
     */
    async updateWarehouse(
        id: string,
        data: {
            name?: string;
            code?: string;
            description?: string;
            address?: string;
        }
    ) {
        return await prisma.warehouse.update({
            where: { id },
            data,
        });
    },

    /**
     * Toggle warehouse active status
     */
    async toggleWarehouseStatus(id: string) {
        const warehouse = await prisma.warehouse.findUnique({
            where: { id },
            select: { isActive: true },
        });

        if (!warehouse) throw new Error("Warehouse not found");

        return await prisma.warehouse.update({
            where: { id },
            data: { isActive: !warehouse.isActive },
        });
    },

    /**
     * Delete warehouse (only if empty)
     */
    async deleteWarehouse(id: string) {
        // Check if warehouse has stock
        const stockCount = await prisma.warehouseStock.count({
            where: { warehouseId: id, quantity: { gt: 0 } },
        });

        if (stockCount > 0) {
            throw new Error(
                "Cannot delete warehouse with existing stock. Transfer or remove stock first."
            );
        }

        return await prisma.warehouse.delete({
            where: { id },
        });
    },

    // ==================== WAREHOUSE STOCK ====================

    /**
     * Get stock for a specific warehouse
     */
    async getWarehouseStock(warehouseId: string) {
        return await prisma.warehouseStock.findMany({
            where: { warehouseId },
            include: {
                product: {
                    include: {
                        category: true,
                    },
                },
                warehouse: true,
            },
            orderBy: {
                product: {
                    name: "asc",
                },
            },
        });
    },

    /**
     * Get stock for a specific product across all warehouses
     */
    async getProductStockByWarehouse(productId: string) {
        return await prisma.warehouseStock.findMany({
            where: { productId },
            include: {
                warehouse: true,
            },
            orderBy: {
                warehouse: {
                    name: "asc",
                },
            },
        });
    },

    /**
     * Get or create warehouse stock entry
     */
    async getOrCreateWarehouseStock(warehouseId: string, productId: string) {
        const existing = await prisma.warehouseStock.findUnique({
            where: {
                warehouseId_productId: {
                    warehouseId,
                    productId,
                },
            },
        });

        if (existing) return existing;

        return await prisma.warehouseStock.create({
            data: {
                warehouseId,
                productId,
                quantity: 0,
            },
        });
    },

    /**
     * Update stock in a warehouse
     * This is typically called as part of a transaction
     */
    async updateWarehouseStock(
        warehouseId: string,
        productId: string,
        quantityChange: number,
        tx?: Prisma.TransactionClient
    ) {
        const client = tx || prisma;

        // Get or create the warehouse stock entry
        const stockEntry = await client.warehouseStock.upsert({
            where: {
                warehouseId_productId: {
                    warehouseId,
                    productId,
                },
            },
            create: {
                warehouseId,
                productId,
                quantity: Math.max(0, quantityChange),
            },
            update: {
                quantity: {
                    increment: quantityChange,
                },
            },
        });

        // Ensure stock doesn't go negative
        if (stockEntry.quantity + quantityChange < 0) {
            throw new Error("Insufficient stock in warehouse");
        }

        return stockEntry;
    },

    /**
     * Calculate total stock for a product across all warehouses
     */
    async calculateProductTotalStock(productId: string) {
        const result = await prisma.warehouseStock.aggregate({
            where: { productId },
            _sum: {
                quantity: true,
            },
        });

        return result._sum.quantity || 0;
    },

    // ==================== WAREHOUSE TRANSFERS ====================

    /**
     * Get all transfers with filters
     */
    async getTransfers(filters?: {
        status?: TransferStatus;
        warehouseId?: string;
        productId?: string;
    }) {
        const where: Prisma.WarehouseTransferWhereInput = {};

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.warehouseId) {
            where.OR = [
                { fromWarehouseId: filters.warehouseId },
                { toWarehouseId: filters.warehouseId },
            ];
        }

        if (filters?.productId) {
            where.productId = filters.productId;
        }

        return await prisma.warehouseTransfer.findMany({
            where,
            include: {
                fromWarehouse: true,
                toWarehouse: true,
                product: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    },

    /**
     * Get a single transfer
     */
    async getTransfer(id: string) {
        return await prisma.warehouseTransfer.findUnique({
            where: { id },
            include: {
                fromWarehouse: true,
                toWarehouse: true,
                product: {
                    include: {
                        category: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
    },

    /**
     * Create a new transfer
     * This removes stock from origin warehouse immediately
     */
    async createTransfer(data: {
        fromWarehouseId: string;
        toWarehouseId: string;
        productId: string;
        quantity: number;
        userId: string;
        notes?: string;
    }) {
        const { fromWarehouseId, toWarehouseId, productId, quantity, userId, notes } = data;

        // Validation
        if (fromWarehouseId === toWarehouseId) {
            throw new Error("Source and destination warehouses must be different");
        }

        if (quantity <= 0) {
            throw new Error("Quantity must be greater than 0");
        }

        return await prisma.$transaction(async (tx) => {
            // Check stock availability in source warehouse
            const sourceStock = await tx.warehouseStock.findUnique({
                where: {
                    warehouseId_productId: {
                        warehouseId: fromWarehouseId,
                        productId,
                    },
                },
            });

            if (!sourceStock || sourceStock.quantity < quantity) {
                throw new Error("Insufficient stock in source warehouse");
            }

            // Deduct stock from source warehouse
            await tx.warehouseStock.update({
                where: {
                    warehouseId_productId: {
                        warehouseId: fromWarehouseId,
                        productId,
                    },
                },
                data: {
                    quantity: {
                        decrement: quantity,
                    },
                },
            });

            // Create stock movement for source (OUT)
            await tx.stockMovement.create({
                data: {
                    productId,
                    warehouseId: fromWarehouseId,
                    type: "OUT",
                    quantity,
                    userId,
                    reason: `Transfer to warehouse (Transfer pending)`,
                },
            });


            // Create transfer record
            return await tx.warehouseTransfer.create({
                data: {
                    fromWarehouseId,
                    toWarehouseId,
                    productId,
                    quantity,
                    userId,
                    notes,
                    status: "PENDING",
                },
                include: {
                    fromWarehouse: true,
                    toWarehouse: true,
                    product: true,
                },
            });
        });
    },

    /**
     * Update transfer status to IN_TRANSIT
     */
    async markTransferInTransit(transferId: string) {
        const transfer = await prisma.warehouseTransfer.findUnique({
            where: { id: transferId },
        });

        if (!transfer) throw new Error("Transfer not found");
        if (transfer.status !== "PENDING") {
            throw new Error("Only pending transfers can be marked as in transit");
        }

        return await prisma.warehouseTransfer.update({
            where: { id: transferId },
            data: { status: "IN_TRANSIT" },
        });
    },

    /**
     * Complete a transfer
     * This adds stock to destination warehouse
     */
    async completeTransfer(transferId: string, userId: string) {
        return await prisma.$transaction(async (tx) => {
            const transfer = await tx.warehouseTransfer.findUnique({
                where: { id: transferId },
            });

            if (!transfer) throw new Error("Transfer not found");
            if (transfer.status === "COMPLETED") {
                throw new Error("Transfer already completed");
            }
            if (transfer.status === "CANCELLED") {
                throw new Error("Cannot complete cancelled transfer");
            }

            // Add stock to destination warehouse
            await tx.warehouseStock.upsert({
                where: {
                    warehouseId_productId: {
                        warehouseId: transfer.toWarehouseId,
                        productId: transfer.productId,
                    },
                },
                create: {
                    warehouseId: transfer.toWarehouseId,
                    productId: transfer.productId,
                    quantity: transfer.quantity,
                },
                update: {
                    quantity: {
                        increment: transfer.quantity,
                    },
                },
            });

            // Create stock movement for destination (IN)
            await tx.stockMovement.create({
                data: {
                    productId: transfer.productId,
                    warehouseId: transfer.toWarehouseId,
                    type: "IN",
                    quantity: transfer.quantity,
                    userId,
                    reason: `Transfer from warehouse completed`,
                },
            });



            // Mark transfer as completed
            return await tx.warehouseTransfer.update({
                where: { id: transferId },
                data: {
                    status: "COMPLETED",
                    completedAt: new Date(),
                },
            });
        });
    },

    /**
     * Cancel a transfer
     * This returns stock to source warehouse
     */
    async cancelTransfer(transferId: string, userId: string) {
        return await prisma.$transaction(async (tx) => {
            const transfer = await tx.warehouseTransfer.findUnique({
                where: { id: transferId },
            });

            if (!transfer) throw new Error("Transfer not found");
            if (transfer.status === "COMPLETED") {
                throw new Error("Cannot cancel completed transfer");
            }
            if (transfer.status === "CANCELLED") {
                throw new Error("Transfer already cancelled");
            }

            // Return stock to source warehouse
            await tx.warehouseStock.update({
                where: {
                    warehouseId_productId: {
                        warehouseId: transfer.fromWarehouseId,
                        productId: transfer.productId,
                    },
                },
                data: {
                    quantity: {
                        increment: transfer.quantity,
                    },
                },
            });

            // Create stock movement for return (IN)
            await tx.stockMovement.create({
                data: {
                    productId: transfer.productId,
                    warehouseId: transfer.fromWarehouseId,
                    type: "IN",
                    quantity: transfer.quantity,
                    userId,
                    reason: `Transfer cancelled - stock returned`,
                },
            });



            // Mark transfer as cancelled
            return await tx.warehouseTransfer.update({
                where: { id: transferId },
                data: {
                    status: "CANCELLED",
                },
            });
        });
    },

    // ==================== ANALYTICS ====================

    /**
     * Get low stock items in a warehouse
     */
    async getLowStockItems(warehouseId: string) {
        const stockItems = await prisma.warehouseStock.findMany({
            where: { warehouseId },
            include: {
                product: true,
            },
        });

        return stockItems.filter((item) => item.quantity <= item.product.minStock);
    },

    /**
     * Get warehouse statistics
     */
    async getWarehouseStats(warehouseId: string) {
        const [totalProducts, totalQuantity, lowStockCount, pendingTransfersOut, pendingTransfersIn] =
            await Promise.all([
                prisma.warehouseStock.count({
                    where: { warehouseId, quantity: { gt: 0 } },
                }),
                prisma.warehouseStock.aggregate({
                    where: { warehouseId },
                    _sum: { quantity: true },
                }),
                prisma.warehouseStock.count({
                    where: {
                        warehouseId,
                        quantity: {
                            lte: prisma.warehouseStock.fields.quantity,
                        },
                    },
                }),
                prisma.warehouseTransfer.count({
                    where: {
                        fromWarehouseId: warehouseId,
                        status: { in: ["PENDING", "IN_TRANSIT"] },
                    },
                }),
                prisma.warehouseTransfer.count({
                    where: {
                        toWarehouseId: warehouseId,
                        status: { in: ["PENDING", "IN_TRANSIT"] },
                    },
                }),
            ]);

        return {
            totalProducts,
            totalQuantity: totalQuantity._sum.quantity || 0,
            lowStockCount,
            pendingTransfersOut,
            pendingTransfersIn,
        };
    },
};
