import prisma from "@/lib/prisma";

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
        // Nuevos campos de compra
        purchaseCode?: string;
        purchaseDate?: Date;
        purchaseAmount?: number;
        supplierId?: string;
        destination?: string;
        receiptImageUrl?: string;
    }) {
        const { initialStock, warehouseId, userId, ...productData } = data;

        return await prisma.$transaction(async (tx) => {
            // 1. Crear producto con stock total
            const product = await tx.product.create({
                data: {
                    ...productData,
                    stock: initialStock || 0,
                },
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

    // Movimientos de Stock
    async registerMovement(data: {
        productId: string;
        warehouseId?: string; // Opcional para llamadas heredadas si las hay
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
                // Para ajuste, ¿la cantidad es el cambio relativo o absoluto?
                // Asumamos que quantity es el CAMBIO. ¿se necesita +/- explícito? ¿o confiamos en el signo de 'quantity'?
                // Usualmente el ajuste maneja establecer directamente o diferencia.
                // Tratemos 'ADJUSTMENT' como "Sumar/Restar" similar a otros pero con etiqueta diferente.
                // ¿O quizás el ajuste sobrescribe el stock?
                // Enfoque más seguro estándar: ADJUSTMENT es solo otro tipo de movimiento donde especificas la diferencia.
                // Implementemos lógica: si ADJUSTMENT, solo agregar quantity (con signo).
                // PERO `quantity` es Int usualmente positivo.
                // Simplifiquemos: IN suma, OUT resta. ADJUSTMENT: ¿Usuario establece nuevo stock?
                // Releyendo requerimientos: "sistema de inventario".
                // Mantengamos IN/OUT por ahora. Si se necesita ADJUSTMENT, decidiremos cómo funciona.
                // Probablemente mejor usar IN/OUT para todos los movimientos. Manteniendo ADJUSTMENT como etiqueta.

                // Asumamos ADJUSTMENT significa "Establecer a valor específico" O "Corrección".
                // Si "Establecer a valor", calculamos diferencia.
                // Implementaré "ADJUSTMENT" como corrección que puede ser positiva o negativa.
                // Dado que `quantity` en esquema es Int, puede ser negativo.
                // Pero usualmente almacenamos cantidad absoluta y Type determina el signo.

                // ¿Prohibamos ADJUSTMENT por ahora o tratemos como lógica IN/OUT dependiendo del contexto?
                // Me mantengo en: IN (+), OUT (-). ADJUSTMENT será tratado como IN si >0, OUT si <0.
                // No, permitamos solo IN/OUT.

                // Espera, esquema tiene enum MovementType { IN, OUT, ADJUSTMENT }.
                // Digamos ADJUSTMENT suma quantity (con signo).
                // Pero revisando esquema anterior: `quantity Int`.

                if (type === "ADJUSTMENT") {
                    newStock += quantity; // ¿Permitir quantity negativa para ajuste?
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
            // 1. Eliminar Stock de Depósito
            await tx.warehouseStock.deleteMany({
                where: { productId: id }
            });

            // 2. Eliminar Movimientos de Stock
            await tx.stockMovement.deleteMany({
                where: { productId: id }
            });

            // 3. Eliminar Transferencias
            // Necesitamos decidir si queremos mantener el historial de transferencias con producto nulo o eliminarlas.
            // Usualmente para una eliminación completa de producto ("remover del sistema"), eliminamos todo.
            await tx.warehouseTransfer.deleteMany({
                where: { productId: id }
            });

            // 4. Finalmente eliminar el Producto
            return await tx.product.delete({
                where: { id }
            });
        });
    },
};
