import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const inventoryService = {
    // Categorías
    async getCategories() {
        return await prisma.category.findMany({
            where: { deletedAt: null },
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
        // Marcar categoría como eliminada lógicamente
        return await prisma.category.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    },

    // Productos (solo activos)
    async getProducts() {
        const products = await prisma.product.findMany({
            where: { deletedAt: null },
            include: {
                category: true,
            },
            orderBy: { name: "asc" },
        });

        const stockItems = await prisma.warehouseStock.findMany();
        const stockByProduct = stockItems.reduce((acc, item) => {
            acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
            return acc;
        }, {} as Record<string, number>);

        return products.map(product => {
            return {
                ...product,
                price: Number(product.price),
                stock: stockByProduct[product.id] || 0,
            };
        });
    },

    // Productos incluyendo los eliminados (para reusar en receipts)
    async getAllProductsIncludingDeleted() {
        const products = await prisma.product.findMany({
            include: {
                category: true,
            },
            orderBy: { name: "asc" },
        });

        // Get warehouse stock separately to avoid relation issues
        const stockItems = await prisma.warehouseStock.findMany();
        const stockByProduct = stockItems.reduce((acc, item) => {
            acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
            return acc;
        }, {} as Record<string, number>);

        return products.map(product => {
            return {
                ...product,
                price: Number(product.price),
                stock: stockByProduct[product.id] || 0,
                isDeleted: product.deletedAt !== null,
            };
        });
    },

    // Productos con stock en un depósito específico
    async getProductsByWarehouse(warehouseId: string) {
        const stockItems = await prisma.warehouseStock.findMany({
            where: { warehouseId },
            include: {
                product: {
                    include: { category: true },
                },
            },
            orderBy: { product: { name: "asc" } },
        });

        return stockItems.map(item => ({
            id: item.product.id,
            sku: item.product.sku,
            name: item.product.name,
            description: item.product.description,
            price: Number(item.product.price),
            unit: item.product.unit,
            minStock: item.product.minStock,
            category: item.product.category,
            stock: item.quantity,
            warehouseId: item.warehouseId,
        }));
    },

    async getProduct(id: string) {
        const product = await prisma.product.findUnique({
            where: { id, deletedAt: null },
            include: {
                category: true,
                supplier: true,
                warehouseStock: true,
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

        if (!product) return null;

        const totalStock = product.warehouseStock.reduce((sum, ws) => sum + ws.quantity, 0);

        return {
            ...product,
            price: Number(product.price),
            stock: totalStock,
        };
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
    }) {
        const { initialStock, warehouseId, userId, ...restData } = data;

        // Construir datos del producto
        const productData = {
            sku: restData.sku,
            name: restData.name,
            price: restData.price,
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
                        sourceType: "ADJUSTMENT",
                        sourceId: product.id,
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
        warehouseId?: string;
        type: "IN" | "OUT" | "ADJUSTMENT";
        quantity: number;
        userId: string;
        reason?: string;
        sourceType: string;
        sourceId: string;
        expedienteId?: string;
    }) {
        const { productId, warehouseId, type, quantity, userId, reason, sourceType, sourceId, expedienteId } = data;

        return await prisma.$transaction(async (tx) => {
            // Validar stock si es OUT y hay warehouse
            if (type === "OUT" && warehouseId) {
                const ws = await tx.warehouseStock.findUnique({
                    where: {
                        warehouseId_productId: {
                            warehouseId,
                            productId,
                        },
                    },
                });
                const currentStock = ws?.quantity || 0;
                if (currentStock < quantity) {
                    throw new Error("Stock insuficiente en el depósito");
                }
            }

            // Actualizar WarehouseStock si hay warehouse
            if (warehouseId) {
                await tx.warehouseStock.upsert({
                    where: {
                        warehouseId_productId: {
                            warehouseId,
                            productId,
                        },
                    },
                    create: {
                        warehouseId,
                        productId,
                        quantity: type === "OUT" ? -quantity : quantity,
                    },
                    update: {
                        quantity: {
                            increment: type === "OUT" ? -quantity : quantity,
                        },
                    },
                });
            }

            return await tx.stockMovement.create({
                data: {
                    productId,
                    warehouseId,
                    type,
                    quantity,
                    userId,
                    reason,
                    sourceType,
                    sourceId,
                    expedienteId
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
        expedienteId?: string;
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
                reason: data.reason || "Asignación de stock",
                sourceType: "ADJUSTMENT",
                sourceId: data.productId, // Using product ID as dummy source
                expedienteId: data.expedienteId
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
        const warehouseStock = await prisma.warehouseStock.findMany({
            where: { productId: id, quantity: { gt: 0 } },
        });

        if (warehouseStock.length > 0) {
            throw new Error("No se puede eliminar un producto que tiene stock en algún depósito");
        }

        return await prisma.product.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    },
};
