import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const inventoryService = {
    // Categorías
    async getCategories() {
        return await prisma.category.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });
    },

    async createCategory(name: string, description?: string) {
        return await prisma.category.create({
            data: { name, description },
        });
    },

    async updateCategory(id: string, name: string, description?: string) {
        return await prisma.category.update({
            where: { id },
            data: { name, description },
        });
    },

    async deleteCategory(id: string) {
        return await prisma.$transaction(async (tx) => {
            // Set categoryId to null for all products in this category
            await tx.product.updateMany({
                where: { categoryId: id },
                data: { categoryId: null },
            });

            // Delete the category
            return await tx.category.delete({
                where: { id },
            });
        });
    },

    // Productos
    async getProducts() {
        return await prisma.product.findMany({
            include: {
                category: true,
            },
            orderBy: { name: "asc" },
        });
    },

    async getProduct(id: string) {
        return await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                supplier: true,
                movements: {
                    orderBy: { createdAt: "desc" },
                    take: 10,
                    include: {
                        user: {
                            select: { email: true, username: true, id: true }
                        },
                        warehouse: true
                    }
                },
            },
        });
    },

    async createProduct(data: {
        sku: string;
        name: string;
        description?: string;
        price: number;
        categoryId?: string;
        minStock?: number;
    }) {
        return await prisma.product.create({
            data: {
                ...data,
                stock: 0, // El stock inicial es 0, usar movimiento para agregar stock
            },
        });
    },

    async createProductWithInitialStock(data: {
        sku: string;
        name: string;
        description?: string;
        price: number;
        unit?: string;
        categoryId?: string;
        minStock?: number;
        initialStock?: number;
        warehouseId?: string;
        userId: string;
        purchaseCode?: string;
        purchaseDate?: Date;
        purchaseAmount?: number;
        supplierId?: string;
        destination?: string;
        receiptImageUrl?: string;
    }) {
        const { initialStock, warehouseId, userId, ...restData } = data;

        // Construir datos del producto de forma profesional y type-safe
        const productData = {
            sku: restData.sku,
            name: restData.name,
            price: restData.price,
            stock: initialStock || 0,
            unit: restData.unit || "U",
            minStock: restData.minStock || 0,
            ...(restData.description && { description: restData.description }),
            ...(restData.categoryId && { categoryId: restData.categoryId }),
        };

        return await prisma.$transaction(async (tx) => {
            // 1. Crear producto con stock total
            const product = await tx.product.create({
                data: productData,
            });

            // 2. Si hay stock inicial, crear entrada de depósito y movimiento
            if (initialStock && initialStock > 0 && warehouseId) {
                // Crear entrada en WarehouseStock
                await tx.warehouseStock.create({
                    data: {
                        warehouseId,
                        productId: product.id,
                        quantity: initialStock,
                    },
                });

                // Crear movimiento de stock (IN)
                await tx.stockMovement.create({
                    data: {
                        productId: product.id,
                        warehouseId,
                        type: "IN",
                        quantity: initialStock,
                        userId,
                        reason: "Stock inicial al crear producto",
                        purchaseCode: restData.purchaseCode,
                        purchaseDate: restData.purchaseDate,
                        purchaseAmount: restData.purchaseAmount,
                        supplierId: restData.supplierId,
                        destination: restData.destination,
                        receiptImageUrl: restData.receiptImageUrl,
                    },
                });
            }

            return product;
        });
    },

    async updateProduct(id: string, data: {
        name?: string;
        description?: string;
        price?: number;
        categoryId?: string;
        minStock?: number;
        unit?: string;
    }) {
        return await prisma.product.update({
            where: { id },
            data,
        });
    },

    // Movimientos de Stock
    async registerMovement(data: {
        productId: string;
        warehouseId?: string; // Opcional para llamadas heredadas si las hay
        type: "IN" | "OUT" | "ADJUSTMENT";
        quantity: number;
        userId: string;
        reason?: string;
        purchaseCode?: string;
        purchaseDate?: Date;
        purchaseAmount?: number;
        supplierId?: string;
        destination?: string;
        receiptImageUrl?: string;
    }) {
        const { productId, warehouseId, type, quantity, userId, reason, purchaseCode, purchaseDate, purchaseAmount, supplierId, destination, receiptImageUrl } = data;

        return await prisma.$transaction(async (tx) => {
            const product = await tx.product.findUnique({ where: { id: productId } });
            if (!product) throw new Error("Producto no encontrado");

            let newStock = product.stock;
            if (type === "IN") {
                newStock += quantity;
            } else if (type === "OUT") {
                if (product.stock < quantity) throw new Error("Stock insuficiente");
                newStock -= quantity;
            } else if (type === "ADJUSTMENT") {
                // ADJUSTMENT suma quantity con signo:
                // quantity > 0 → agrega stock (corrección positiva)
                // quantity < 0 → resta stock (corrección negativa)
                newStock += quantity;
            }

            await tx.product.update({
                where: { id: productId },
                data: { stock: newStock },
            });

            return await tx.stockMovement.create({
                data: {
                    productId,
                    warehouseId,
                    type,
                    quantity,
                    userId,
                    reason,
                    purchaseCode,
                    purchaseDate,
                    purchaseAmount,
                    supplierId,
                    destination,
                    receiptImageUrl
                }
            });
        });
    },

    async registerStockAssignment(data: {
        productId: string;
        warehouseId: string;
        quantity: number;
        userId: string;
        reason?: string;
    }) {
        // Records an assignment (IN) to a warehouse without changing Product Total Stock
        // This implies the stock was "Unassigned" and is now "Assigned".
        return await prisma.stockMovement.create({
            data: {
                productId: data.productId,
                warehouseId: data.warehouseId,
                type: "IN", // We keep it IN for the warehouse perspective
                quantity: data.quantity,
                userId: data.userId,
                reason: data.reason || "Asignación de stock"
            }
        });
    },

    async getStockMovements(filters?: {
        type?: "IN" | "OUT" | "ADJUSTMENT";
        warehouseId?: string;
        productId?: string;
        userId?: string;
        limit?: number;
    }) {
        // Usar el tipo generado por Prisma para type-safety completa
        const where: Prisma.StockMovementWhereInput = {};
        if (filters?.type) where.type = filters.type;
        if (filters?.warehouseId) where.warehouseId = filters.warehouseId;
        if (filters?.productId) where.productId = filters.productId;
        if (filters?.userId) where.userId = filters.userId;

        return await prisma.stockMovement.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: filters?.limit,
            include: {
                product: {
                    include: { category: true }
                },
                warehouse: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
    },

    async deleteProduct(id: string) {
        return await prisma.$transaction(async (tx) => {
            // Eliminar manualmente todas las relaciones que no tienen onDelete: Cascade
            
            // 1. Transferencias entre depósitos
            await tx.warehouseTransfer.deleteMany({
                where: { productId: id },
            });

            // 2. Movimientos de stock
            await tx.stockMovement.deleteMany({
                where: { productId: id },
            });

            // 3. Items de órdenes de compra
            await tx.purchaseOrderItem.deleteMany({
                where: { productId: id },
            });

            // 4. Items de entregas
            await tx.deliveryItem.deleteMany({
                where: { productId: id },
            });

            // WarehouseStock SÍ tiene onDelete: Cascade en el schema,
            // pero lo borramos igual para ser explícitos o por si acaso.
            await tx.warehouseStock.deleteMany({
                where: { productId: id },
            });

            // Finalmente eliminar el producto
            return await tx.product.delete({
                where: { id },
            });
        });
    },
};
