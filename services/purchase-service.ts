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
        const where: Prisma.PurchaseOrderWhereInput = {
            deletedAt: null,
        };

        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.supplierId) {
            where.supplierId = filters.supplierId;
        }
        if (filters?.warehouseId) {
            where.warehouseId = filters.warehouseId;
        }

        const orders = await prisma.purchaseOrder.findMany({
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

        return orders.map(order => ({
            ...order,
            totalAmount: Number(order.totalAmount),
        }));
    },

    /**
     * Get a single purchase order with full details
     */
    async getPurchaseOrder(id: string) {
        const order = await prisma.purchaseOrder.findUnique({
            where: { id, deletedAt: null },
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

        if (!order) return null;

        return {
            ...order,
            totalAmount: Number(order.totalAmount),
            items: order.items.map(item => ({
                ...item,
                unitPrice: Number(item.unitPrice),
                product: {
                    ...item.product,
                    price: Number(item.product.price),
                }
            }))
        };
    },

    async createPurchaseOrder(data: {
        supplierId: string;
        warehouseId: string;
        createdById: string;
        expedienteId?: string;
        expectedDate?: Date;
        notes?: string;
        items: Array<{
            productId: string;
            quantity: number;
            unitPrice: number;
        }>;
    }) {
        const { items, expedienteId, ...orderData } = data;

        // Calculate total amount
        const totalAmount = items.reduce(
            (sum, item) => sum + item.quantity * item.unitPrice,
            0
        );

        // Generate order number
        const count = await prisma.purchaseOrder.count();
        const orderNumber = `OC-${String(count + 1).padStart(6, "0")}`;

        const order = await prisma.purchaseOrder.create({
            data: {
                ...orderData,
                orderNumber,
                totalAmount,
                expedienteId,
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

        return {
            ...order,
            totalAmount: Number(order.totalAmount),
            items: order.items.map(item => ({
                ...item,
                unitPrice: Number(item.unitPrice),
                product: {
                    ...item.product,
                    price: Number(item.product.price),
                }
            }))
        };
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
            prisma.purchaseOrder.count({
                where: { deletedAt: null }
            }),
            prisma.purchaseOrder.aggregate({
                where: {
                    status: { in: ["RECEIVED", "PARTIAL"] },
                    deletedAt: null,
                },
                _sum: {
                    totalAmount: true,
                },
            }),
            prisma.purchaseOrder.count({
                where: { status: "PENDING", deletedAt: null },
            }),
            prisma.purchaseOrder.count({
                where: { status: "DRAFT", deletedAt: null },
            }),
        ]);

        return {
            totalOrders,
            totalSpent: Number(totalSpent._sum.totalAmount || 0),
            pendingOrders,
            draftOrders,
        };
    },
};
