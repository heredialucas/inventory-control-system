import prisma from "@/lib/prisma";

export const inventoryService = {
    // Categories
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

    // Products
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
                stock: 0, // Initial stock is 0, use movement to add stock
            },
        });
    },

    async createProductWithInitialStock(data: {
        sku: string;
        name: string;
        description?: string;
        price: number;
        categoryId?: string;
        minStock?: number;
        initialStock?: number;
        warehouseId?: string;
        userId: string;
    }) {
        const { initialStock, warehouseId, userId, ...productData } = data;

        return await prisma.$transaction(async (tx) => {
            // 1. Create product with total stock
            const product = await tx.product.create({
                data: {
                    ...productData,
                    stock: initialStock || 0,
                },
            });

            // 2. If there's initial stock, create warehouse entry and movement
            if (initialStock && initialStock > 0 && warehouseId) {
                // Create entry in WarehouseStock
                await tx.warehouseStock.create({
                    data: {
                        warehouseId,
                        productId: product.id,
                        quantity: initialStock,
                    },
                });

                // Create stock movement (IN)
                await tx.stockMovement.create({
                    data: {
                        productId: product.id,
                        warehouseId,
                        type: "IN",
                        quantity: initialStock,
                        userId,
                        reason: "Stock inicial al crear producto",
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
    }) {
        return await prisma.product.update({
            where: { id },
            data,
        });
    },

    // Stock Movements
    async registerMovement(data: {
        productId: string;
        warehouseId?: string; // Made optional to support legacy calls if any, or strictly optional
        type: "IN" | "OUT" | "ADJUSTMENT";
        quantity: number;
        userId: string;
        reason?: string;
    }) {
        const { productId, warehouseId, type, quantity, userId, reason } = data;

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
                // For adjustment, quantity is the relative change or absolute? 
                // Let's assume quantity is the CHANGE. explicit +/- needed? or we trust 'quantity' sign?
                // Usually adjustment handles direct set or diff. 
                // Let's treat 'ADJUSTMENT' as "Add/Subtract" similar to others but with different label?
                // Or maybe adjustment overrides stock?
                // Standard safer approach: ADJUSTMENT is just another type of move where you specify diff.
                // Let's implement logic: if ADJUSTMENT, just add quantity (signed). 
                // BUT `quantity` is Int usually positive. 
                // Let's simplify: IN adds, OUT subtracts. ADJUSTMENT: User sets new stock?
                // Re-reading requirements: "sistema de inventario".
                // Let's stick to IN/OUT for now. If ADJUSTMENT needed, we'll decide how it works. 
                // Probably best to just use IN/OUT for all moves. keeping ADJUSTMENT as a label.

                // Let's assume ADJUSTMENT means "Set to specific value" OR "Correction".
                // If "Set to value", we calculate diff.
                // I will implement "ADJUSTMENT" as a correction that can be positive or negative?
                // Since `quantity` in schema is Int, it can be negative. 
                // But usually we store absolute quantity and Type determines sign.

                // Let's forbid ADJUSTMENT for now or treat as IN/OUT logic depending on context?
                // I'll stick to: IN (+), OUT (-). ADJUSTMENT will be treated as IN if >0, OUT if <0? 
                // No, let's just allow IN/OUT.

                // Wait, schema has enum MovementType { IN, OUT, ADJUSTMENT }.
                // Let's say ADJUSTMENT adds quantity (signed).
                // But checking previous schema: `quantity Int`.

                if (type === "ADJUSTMENT") {
                    newStock += quantity; // Allow negative quantity for adjustment?
                }
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
                    reason
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
        const where: any = {};
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
            // 1. Delete Warehouse Stock
            await tx.warehouseStock.deleteMany({
                where: { productId: id }
            });

            // 2. Delete Stock Movements
            await tx.stockMovement.deleteMany({
                where: { productId: id }
            });

            // 3. Delete Transfers 
            // We need to decide if we want to keep transfer history with null product or delete them.
            // Usually for a hard delete of product ("removing from system"), we delete everything.
            await tx.warehouseTransfer.deleteMany({
                where: { productId: id }
            });

            // 4. Finally delete the Product
            return await tx.product.delete({
                where: { id }
            });
        });
    },
};
