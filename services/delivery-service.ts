import prisma from "@/lib/prisma";
import { Prisma, DeliveryStatus } from "@prisma/client";

export const deliveryService = {
    /**
     * Get all deliveries with filters
     */
    async getDeliveries(filters?: {
        status?: DeliveryStatus;
        institutionId?: string;
        warehouseId?: string;
    }) {
        const where: Prisma.DeliveryWhereInput = {};

        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.institutionId) {
            where.institutionId = filters.institutionId;
        }
        if (filters?.warehouseId) {
            where.warehouseId = filters.warehouseId;
        }

        return await prisma.delivery.findMany({
            where,
            include: {
                institution: true,
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
     * Get a single delivery
     */
    async getDelivery(id: string) {
        return await prisma.delivery.findUnique({
            where: { id },
            include: {
                institution: true,
                warehouse: true,
                createdBy: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
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
                },
            },
        });
    },

    /**
     * Create a new delivery
     */
    async createDelivery(data: {
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
        const { items, ...deliveryData } = data;

        // Generate delivery number
        const count = await prisma.delivery.count();
        const deliveryNumber = `DLV-${String(count + 1).padStart(6, "0")}`;

        return await prisma.delivery.create({
            data: {
                ...deliveryData,
                deliveryNumber,
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
                institution: true,
                warehouse: true,
            },
        });
    },

    /**
     * Update delivery
     */
    async updateDelivery(
        id: string,
        data: {
            deliveryDate?: Date;
            receivedBy?: string;
            notes?: string;
            status?: DeliveryStatus;
        }
    ) {
        return await prisma.delivery.update({
            where: { id },
            data,
        });
    },

    /**
     * Confirm delivery (transition from DRAFT to CONFIRMED)
     */
    async confirmDelivery(id: string) {
        const delivery = await prisma.delivery.findUnique({
            where: { id },
        });

        if (!delivery) throw new Error("Delivery not found");
        if (delivery.status !== "DRAFT") {
            throw new Error("Only draft deliveries can be confirmed");
        }

        return await prisma.delivery.update({
            where: { id },
            data: { status: "CONFIRMED" },
        });
    },

    /**
     * Mark delivery as delivered and update stock
     */
    async markAsDelivered(deliveryId: string, userId: string) {
        return await prisma.$transaction(async (tx) => {
            const delivery = await tx.delivery.findUnique({
                where: { id: deliveryId },
                include: {
                    items: true,
                },
            });

            if (!delivery) throw new Error("Delivery not found");
            if (delivery.status === "DELIVERED" || delivery.status === "CANCELLED") {
                throw new Error(`Cannot mark ${delivery.status.toLowerCase()} delivery as delivered`);
            }

            // Update stock for each item
            for (const item of delivery.items) {
                // Reduce warehouse stock
                const warehouseStock = await tx.warehouseStock.findUnique({
                    where: {
                        warehouseId_productId: {
                            warehouseId: delivery.warehouseId,
                            productId: item.productId,
                        },
                    },
                });

                if (!warehouseStock || warehouseStock.quantity < item.quantity) {
                    throw new Error(`Insufficient stock for product ${item.productId}`);
                }

                await tx.warehouseStock.update({
                    where: {
                        warehouseId_productId: {
                            warehouseId: delivery.warehouseId,
                            productId: item.productId,
                        },
                    },
                    data: {
                        quantity: {
                            decrement: item.quantity,
                        },
                    },
                });

                // Reduce product total stock
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });

                // Create stock movement
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        warehouseId: delivery.warehouseId,
                        type: "OUT",
                        quantity: item.quantity,
                        userId,
                        reason: `Delivery ${delivery.deliveryNumber} to institution`,
                    },
                });
            }

            // Update delivery status
            return await tx.delivery.update({
                where: { id: deliveryId },
                data: {
                    status: "DELIVERED",
                    deliveryDate: new Date(),
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
     * Cancel delivery
     */
    async cancelDelivery(id: string) {
        const delivery = await prisma.delivery.findUnique({
            where: { id },
        });

        if (!delivery) throw new Error("Delivery not found");
        if (delivery.status === "DELIVERED") {
            throw new Error("Cannot cancel delivered delivery");
        }

        return await prisma.delivery.update({
            where: { id },
            data: { status: "CANCELLED" },
        });
    },

    /**
     * Get delivery statistics
     */
    async getDeliveryStats() {
        const [totalDeliveries, deliveredCount, pendingCount, draftCount] = await Promise.all([
            prisma.delivery.count(),
            prisma.delivery.count({
                where: { status: "DELIVERED" },
            }),
            prisma.delivery.count({
                where: { status: "CONFIRMED" },
            }),
            prisma.delivery.count({
                where: { status: "DRAFT" },
            }),
        ]);

        return {
            totalDeliveries,
            deliveredCount,
            pendingCount,
            draftCount,
        };
    },
};
