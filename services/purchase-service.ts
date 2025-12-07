import prisma from "@/lib/prisma";
import { Prisma, PurchaseOrderStatus } from "@prisma/client";

export const purchaseService = {
    // ==================== PURCHASE ORDER CRUD ====================

    /**
     * Get all purchase orders with filters
     */
    async getPurchaseOrders(filters?: {
        status?: PurchaseOrderStatus;
        supplierId?: string;
        warehouseId?: string;
    }) {
        const where: Prisma.PurchaseOrderWhereInput = {};

        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.supplierId) {
            where.supplierId = filters.supplierId;
        }
        if (filters?.warehouseId) {
            where.warehouseId = filters.warehouseId;
        }

        return await prisma.purchaseOrder.findMany({
            where,
            include: {
                supplier: true,
                warehouse: true,
                createdBy: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                    },
                },
                _count: {
                    select: {
                        items: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    },

    /**
     * Get a single purchase order with full details
     */
    async getPurchaseOrder(id: string) {
        return await prisma.purchaseOrder.findUnique({
            where: { id },
            include: {
                supplier: true,
                warehouse: true,
                createdBy: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                items: {
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
            },
        });
    },

    /**
     * Create a new purchase order
     */
    async createPurchaseOrder(data: {
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
        const { items, ...orderData } = data;

        // Calculate total amount
        const totalAmount = items.reduce(
            (sum, item) => sum + item.quantity * item.unitPrice,
            0
        );

        // Generate order number
        const count = await prisma.purchaseOrder.count();
        const orderNumber = `OC-${String(count + 1).padStart(6, "0")}`;

        return await prisma.purchaseOrder.create({
            data: {
                ...orderData,
                orderNumber,
                totalAmount,
                items: {
                    create: items,
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                supplier: true,
                warehouse: true,
            },
        });
    },

    /**
     * Update purchase order
     */
    async updatePurchaseOrder(
        id: string,
        data: {
            expectedDate?: Date;
            notes?: string;
            status?: PurchaseOrderStatus;
        }
    ) {
        return await prisma.purchaseOrder.update({
            where: { id },
            data,
        });
    },

    /**
     * Receive purchase order (complete or partial)
     * Updates stock in the warehouse
     */
    async receivePurchaseOrder(
        orderId: string,
        userId: string,
        receivedItems: Array<{
            itemId: string;
            quantity: number;
        }>
    ) {
        return await prisma.$transaction(async (tx) => {
            // Get purchase order
            const order = await tx.purchaseOrder.findUnique({
                where: { id: orderId },
                include: {
                    items: true,
                },
            });

            if (!order) throw new Error("Orden de compra no encontrada");
            if (order.status === "RECEIVED" || order.status === "CANCELLED") {
                throw new Error(`No se puede recibir orden ${order.status.toLowerCase()}`);
            }

            // Process each received item
            for (const received of receivedItems) {
                const orderItem = order.items.find((item) => item.id === received.itemId);
                if (!orderItem) {
                    throw new Error(`Artículo de orden ${received.itemId} no encontrado`);
                }

                const remainingQty = orderItem.quantity - orderItem.receivedQty;
                if (received.quantity > remainingQty) {
                    throw new Error(
                        `No se pueden recibir ${received.quantity} unidades. Solo quedan ${remainingQty}.`
                    );
                }

                // Update received quantity
                await tx.purchaseOrderItem.update({
                    where: { id: received.itemId },
                    data: {
                        receivedQty: {
                            increment: received.quantity,
                        },
                    },
                });

                // Update warehouse stock
                await tx.warehouseStock.upsert({
                    where: {
                        warehouseId_productId: {
                            warehouseId: order.warehouseId,
                            productId: orderItem.productId,
                        },
                    },
                    create: {
                        warehouseId: order.warehouseId,
                        productId: orderItem.productId,
                        quantity: received.quantity,
                    },
                    update: {
                        quantity: {
                            increment: received.quantity,
                        },
                    },
                });

                // Update product total stock
                await tx.product.update({
                    where: { id: orderItem.productId },
                    data: {
                        stock: {
                            increment: received.quantity,
                        },
                    },
                });

                // Create stock movement
                await tx.stockMovement.create({
                    data: {
                        productId: orderItem.productId,
                        warehouseId: order.warehouseId,
                        type: "IN",
                        quantity: received.quantity,
                        userId,
                        reason: `Orden de compra ${order.orderNumber} recibida`,
                    },
                });
            }

            // Check if all items are fully received
            const updatedItems = await tx.purchaseOrderItem.findMany({
                where: { purchaseOrderId: orderId },
            });

            const allReceived = updatedItems.every(
                (item) => item.receivedQty === item.quantity
            );
            const partialReceived = updatedItems.some(
                (item) => item.receivedQty > 0 && item.receivedQty < item.quantity
            );

            let newStatus: PurchaseOrderStatus = order.status;
            if (allReceived) {
                newStatus = "RECEIVED";
            } else if (partialReceived || updatedItems.some((item) => item.receivedQty > 0)) {
                newStatus = "PARTIAL";
            }

            // Update order status
            return await tx.purchaseOrder.update({
                where: { id: orderId },
                data: {
                    status: newStatus,
                    receivedDate: allReceived ? new Date() : order.receivedDate,
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });
        });
    },

    /**
     * Cancel purchase order
     */
    async cancelPurchaseOrder(id: string) {
        const order = await prisma.purchaseOrder.findUnique({
            where: { id },
            include: {
                items: true,
            },
        });

        if (!order) throw new Error("Orden de compra no encontrada");
        if (order.status === "RECEIVED") {
            throw new Error("No se puede cancelar orden ya recibida");
        }
        if (order.items.some((item) => item.receivedQty > 0)) {
            throw new Error("No se puede cancelar orden con artículos recibidos");
        }

        return await prisma.purchaseOrder.update({
            where: { id },
            data: { status: "CANCELLED" },
        });
    },

    /**
     * Mark order as pending (submitted to supplier)
     */
    async submitPurchaseOrder(id: string) {
        const order = await prisma.purchaseOrder.findUnique({
            where: { id },
        });

        if (!order) throw new Error("Orden de compra no encontrada");
        if (order.status !== "DRAFT") {
            throw new Error("Solo se pueden enviar órdenes en borrador");
        }

        return await prisma.purchaseOrder.update({
            where: { id },
            data: { status: "PENDING" },
        });
    },

    /**
     * Get purchase order statistics
     */
    async getPurchaseStats() {
        const [totalOrders, totalSpent, pendingOrders, draftOrders] = await Promise.all([
            prisma.purchaseOrder.count(),
            prisma.purchaseOrder.aggregate({
                where: {
                    status: { in: ["RECEIVED", "PARTIAL"] },
                },
                _sum: {
                    totalAmount: true,
                },
            }),
            prisma.purchaseOrder.count({
                where: { status: "PENDING" },
            }),
            prisma.purchaseOrder.count({
                where: { status: "DRAFT" },
            }),
        ]);

        return {
            totalOrders,
            totalSpent: totalSpent._sum.totalAmount || 0,
            pendingOrders,
            draftOrders,
        };
    },
};
