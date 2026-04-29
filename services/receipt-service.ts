import prisma from "@/lib/prisma";
import { Prisma, PurchaseOrderStatus } from "@prisma/client";

export const receiptService = {
    /**
     * Get all purchase receipts
     */
    async getReceipts(filters?: { expedienteId?: string; purchaseOrderId?: string }) {
        const where: Prisma.PurchaseReceiptWhereInput = {};

        if (filters?.expedienteId) {
            where.expedienteId = filters.expedienteId;
        }

        if (filters?.purchaseOrderId) {
            where.purchaseOrderId = filters.purchaseOrderId;
        }

        const receipts = await prisma.purchaseReceipt.findMany({
            where,
            include: {
                purchaseOrder: {
                    include: {
                        supplier: true,
                        warehouse: true,
                    }
                },
                expediente: true,
                warehouse: true,
                supplier: true,
                _count: {
                    select: {
                        items: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return receipts.map(receipt => ({
            ...receipt,
            totalAmount: Number(receipt.totalAmount),
            purchaseOrder: receipt.purchaseOrder ? {
                ...receipt.purchaseOrder,
                totalAmount: Number(receipt.purchaseOrder.totalAmount),
            } : null,
        }));
    },

    /**
     * Get a single receipt
     */
    async getReceipt(id: string) {
        const receipt = await prisma.purchaseReceipt.findUnique({
            where: { id },
            include: {
                purchaseOrder: {
                    include: {
                        supplier: true,
                        warehouse: true,
                    }
                },
                expediente: true,
                warehouse: true,
                supplier: true,
                items: {
                    include: {
                        product: true,
                    }
                }
            },
        });

        if (!receipt) return null;

        return {
            ...receipt,
            totalAmount: Number(receipt.totalAmount),
            purchaseOrder: receipt.purchaseOrder ? {
                ...receipt.purchaseOrder,
                totalAmount: Number(receipt.purchaseOrder.totalAmount),
            } : null,
            items: receipt.items.map(item => ({
                ...item,
                product: {
                    ...item.product,
                    price: Number(item.product.price),
                }
            }))
        };
    },

    /**
     * Create a Purchase Receipt and handle all stock updates and movement generation.
     */
    async createReceipt(data: {
        purchaseOrderId?: string;
        warehouseId?: string;
        receiptNumber: string;
        date: Date;
        imageUrl?: string;
        userId: string;
        expedienteId?: string;
        supplierId?: string;
        items: Array<{
            itemId?: string;    // Optional if not from PO
            productId: string;
            quantity: number;
        }>;
    }) {
        const { purchaseOrderId, warehouseId, receiptNumber, date, imageUrl, userId, expedienteId, supplierId, items } = data;

        return await prisma.$transaction(async (tx) => {
            let finalWarehouseId = warehouseId;
            let receiptTotalAmount = 0;
            let order = null;

            // 1. If linked to a PO, get info and validate
            if (purchaseOrderId) {
                order = await tx.purchaseOrder.findUnique({
                    where: { id: purchaseOrderId },
                    include: { items: true },
                });

                if (!order) throw new Error("Orden de compra no encontrada");
                finalWarehouseId = order.warehouseId;

                for (const received of items) {
                    if (received.itemId) {
                        const orderItem = order.items.find((item) => item.id === received.itemId);
                        if (orderItem) {
                            const remainingQty = orderItem.quantity - orderItem.receivedQty;
                            if (received.quantity > remainingQty) {
                                throw new Error(`No se pueden recibir ${received.quantity} unidades. Solo quedan ${remainingQty}.`);
                            }
                            receiptTotalAmount += received.quantity * Number(orderItem.unitPrice);
                        }
                    }
                }
            } else {
                // If direct entry, we need a warehouse and we calculate total based on current product price
                if (!finalWarehouseId) throw new Error("Debe seleccionar un depósito para el ingreso directo");
                
                const productIds = items.map(i => i.productId);
                const products = await tx.product.findMany({
                    where: { id: { in: productIds } }
                });

                for (const received of items) {
                    const product = products.find(p => p.id === received.productId);
                    if (product) {
                        receiptTotalAmount += received.quantity * Number(product.price);
                    }
                }
            }

            // 2. Create Purchase Receipt Record
            const receipt = await tx.purchaseReceipt.create({
                data: {
                    purchaseOrderId: purchaseOrderId || null,
                    warehouseId: purchaseOrderId ? null : finalWarehouseId,
                    receiptNumber,
                    date,
                    imageUrl,
                    totalAmount: receiptTotalAmount,
                    expedienteId: expedienteId || order?.expedienteId || null,
                    supplierId: supplierId || order?.supplierId || null,
                    items: {
                        create: items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                        }))
                    }
                }
            });

            // 3. Process each item (Update Stock & Movements)
            for (const received of items) {
                // Update PO Item if applicable
                if (purchaseOrderId && received.itemId) {
                    await tx.purchaseOrderItem.update({
                        where: { id: received.itemId },
                        data: { receivedQty: { increment: received.quantity } },
                    });
                }

                // Update Warehouse Stock
                await tx.warehouseStock.upsert({
                    where: {
                        warehouseId_productId: {
                            warehouseId: finalWarehouseId!,
                            productId: received.productId,
                        },
                    },
                    create: {
                        warehouseId: finalWarehouseId!,
                        productId: received.productId,
                        quantity: received.quantity,
                    },
                    update: {
                        quantity: { increment: received.quantity },
                    },
                });

                // Update Product Total Stock
                await tx.product.update({
                    where: { id: received.productId },
                    data: { stock: { increment: received.quantity } },
                });

                // Create Stock Movement
                await tx.stockMovement.create({
                    data: {
                        productId: received.productId,
                        warehouseId: finalWarehouseId,
                        type: "IN",
                        quantity: received.quantity,
                        reason: purchaseOrderId 
                            ? `Recepción de orden ${order?.orderNumber} (Remito ${receiptNumber})`
                            : `Ingreso directo de stock (Remito ${receiptNumber})`,
                        userId,
                        sourceType: "RECEIPT",
                        sourceId: receipt.id,
                        expedienteId: expedienteId || order?.expedienteId || null,
                    },
                });
            }

            // 4. Update PO status if applicable
            if (purchaseOrderId) {
                const updatedItems = await tx.purchaseOrderItem.findMany({
                    where: { purchaseOrderId },
                });

                const allReceived = updatedItems.every(item => item.receivedQty === item.quantity);
                const partialReceived = updatedItems.some(item => item.receivedQty > 0);

                await tx.purchaseOrder.update({
                    where: { id: purchaseOrderId },
                    data: {
                        status: allReceived ? "RECEIVED" : partialReceived ? "PARTIAL" : "PENDING",
                        receivedDate: allReceived ? new Date() : order?.receivedDate,
                    },
                });
            }

            const receiptWithDetails = await tx.purchaseReceipt.findUnique({
                where: { id: receipt.id },
                include: {
                    purchaseOrder: true,
                    expediente: true,
                    warehouse: true,
                    supplier: true,
                }
            });

            if (!receiptWithDetails) return receipt;

            return {
                ...receiptWithDetails,
                totalAmount: Number(receiptWithDetails.totalAmount),
                purchaseOrder: receiptWithDetails.purchaseOrder ? {
                    ...receiptWithDetails.purchaseOrder,
                    totalAmount: Number(receiptWithDetails.purchaseOrder.totalAmount),
                } : null,
            };
        });
    },

    /**
     * Update an existing receipt
     */
    async updateReceipt(id: string, data: {
        receiptNumber?: string;
        date?: Date;
        imageUrl?: string;
        warehouseId?: string;
        expedienteId?: string;
        supplierId?: string;
        items?: Array<{
            productId: string;
            quantity: number;
        }>;
        userId: string;
    }) {
        const { receiptNumber, date, imageUrl, warehouseId, expedienteId, supplierId, items, userId } = data;

        return await prisma.$transaction(async (tx) => {
            const oldReceipt = await tx.purchaseReceipt.findUnique({
                where: { id },
                include: { items: true }
            });

            if (!oldReceipt) throw new Error("Remito no encontrado");

            // 1. Revert old stock if items are provided
            if (items) {
                for (const oldItem of oldReceipt.items) {
                    await tx.warehouseStock.update({
                        where: {
                            warehouseId_productId: {
                                warehouseId: oldReceipt.warehouseId!,
                                productId: oldItem.productId,
                            },
                        },
                        data: { quantity: { decrement: oldItem.quantity } },
                    });

                    await tx.product.update({
                        where: { id: oldItem.productId },
                        data: { stock: { decrement: oldItem.quantity } },
                    });
                }

                // Delete old items
                await tx.purchaseReceiptItem.deleteMany({
                    where: { receiptId: id }
                });
            }

            // 2. Calculate new total amount
            let receiptTotalAmount = Number(oldReceipt.totalAmount);
            if (items) {
                receiptTotalAmount = 0;
                const productIds = items.map(i => i.productId);
                const products = await tx.product.findMany({
                    where: { id: { in: productIds } }
                });

                for (const item of items) {
                    const product = products.find(p => p.id === item.productId);
                    if (product) {
                        receiptTotalAmount += item.quantity * Number(product.price);
                    }
                }
            }

            // 3. Update Receipt Record
            const updatedReceipt = await tx.purchaseReceipt.update({
                where: { id },
                data: {
                    receiptNumber: receiptNumber ?? oldReceipt.receiptNumber,
                    date: date ?? oldReceipt.date,
                    imageUrl: imageUrl ?? oldReceipt.imageUrl,
                    warehouseId: warehouseId ?? oldReceipt.warehouseId,
                    expedienteId: expedienteId !== undefined ? (expedienteId === "none" ? null : expedienteId) : oldReceipt.expedienteId,
                    supplierId: supplierId !== undefined ? (supplierId === "none" ? null : supplierId) : oldReceipt.supplierId,
                    totalAmount: receiptTotalAmount,
                    items: items ? {
                        create: items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                        }))
                    } : undefined
                }
            });

            // 4. Apply new stock
            if (items) {
                const finalWarehouseId = warehouseId ?? oldReceipt.warehouseId;
                for (const item of items) {
                    await tx.warehouseStock.upsert({
                        where: {
                            warehouseId_productId: {
                                warehouseId: finalWarehouseId!,
                                productId: item.productId,
                            },
                        },
                        create: {
                            warehouseId: finalWarehouseId!,
                            productId: item.productId,
                            quantity: item.quantity,
                        },
                        update: {
                            quantity: { increment: item.quantity },
                        },
                    });

                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } },
                    });

                    // Create movement for adjustment
                    await tx.stockMovement.create({
                        data: {
                            productId: item.productId,
                            warehouseId: finalWarehouseId,
                            type: "ADJUSTMENT",
                            quantity: item.quantity,
                            reason: `Edición de remito ${updatedReceipt.receiptNumber}`,
                            userId,
                            sourceType: "RECEIPT",
                            sourceId: updatedReceipt.id,
                            expedienteId: updatedReceipt.expedienteId,
                        },
                    });
                }
            }

            return updatedReceipt;
        });
    },
};
