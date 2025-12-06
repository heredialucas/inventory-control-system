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
                        }
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
        type: "IN" | "OUT" | "ADJUSTMENT";
        quantity: number;
        userId: string;
        reason?: string;
    }) {
        const { productId, type, quantity, userId, reason } = data;

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
                    type,
                    quantity,
                    userId,
                    reason
                }
            });
        });
    },

    async deleteProduct(id: string) {
        // Check if there are movements? 
        // If we want to allow delete, we cascade or check.
        // Schema says: movements StockMovement[]
        // If we delete product, what happens to movements?
        // In schema: `product Product @relation(fields: [productId], references: [id])`.
        // Default is usually restrict. 
        // If we want to delete, we might need to delete movements first or cascade.
        // Let's assume for now we just try delete. If constraint fails, it throws.
        return await prisma.product.delete({
            where: { id }
        });
    },
};
