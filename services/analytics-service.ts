import prisma from "@/lib/prisma";

export const analyticsService = {
    /**
     * Get dashboard overview statistics
     */
    async getDashboardStats() {
        const [
            totalProducts,
            totalWarehouses,
            totalSuppliers,
            totalInstitutions,
            lowStockProducts,
            recentMovements,
            pendingTransfers,
            pendingPurchases,
            pendingDeliveries,
        ] = await Promise.all([
            // Total products
            prisma.product.count(),

            // Total warehouses
            prisma.warehouse.count({ where: { isActive: true } }),

            // Total suppliers
            prisma.supplier.count({ where: { isActive: true } }),

            // Total institutions
            prisma.institution.count({ where: { isActive: true } }),

            // Low stock products (stock < minStock)
            prisma.product.count({
                where: {
                    stock: {
                        lt: prisma.product.fields.minStock,
                    },
                },
            }),

            // Recent movements (last 7 days)
            prisma.stockMovement.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                },
            }),

            // Pending transfers
            prisma.warehouseTransfer.count({
                where: {
                    status: {
                        in: ["PENDING", "IN_TRANSIT"],
                    },
                },
            }),

            // Pending purchase orders
            prisma.purchaseOrder.count({
                where: {
                    status: {
                        in: ["DRAFT", "PENDING"],
                    },
                },
            }),

            // Pending deliveries
            prisma.delivery.count({
                where: {
                    status: {
                        in: ["DRAFT", "CONFIRMED"],
                    },
                },
            }),
        ]);

        // Calculate total stock value
        const products = await prisma.product.findMany({
            select: {
                stock: true,
                price: true,
            },
        });

        const totalStockValue = products.reduce(
            (sum, p) => sum + p.stock * Number(p.price || 0),
            0
        );

        return {
            totalProducts,
            totalWarehouses,
            totalSuppliers,
            totalInstitutions,
            lowStockProducts,
            recentMovements,
            pendingTransfers,
            pendingPurchases,
            pendingDeliveries,
            totalStockValue,
        };
    },

    /**
     * Get stock report by category
     */
    async getStockByCategory() {
        const categories = await prisma.category.findMany({
            include: {
                products: {
                    select: {
                        stock: true,
                        price: true,
                    },
                },
            },
        });

        return categories.map((category) => ({
            categoryName: category.name,
            productCount: category.products.length,
            totalStock: category.products.reduce((sum, p) => sum + p.stock, 0),
            totalValue: category.products.reduce(
                (sum, p) => sum + p.stock * Number(p.price || 0),
                0
            ),
        }));
    },

    /**
     * Get stock report by warehouse
     */
    async getStockByWarehouse() {
        const warehouses = await prisma.warehouse.findMany({
            where: { isActive: true },
            include: {
                stockItems: {
                    include: {
                        product: {
                            select: {
                                price: true,
                            },
                        },
                    },
                },
            },
        });

        return warehouses.map((warehouse) => ({
            warehouseName: warehouse.name,
            warehouseCode: warehouse.code,
            productCount: warehouse.stockItems.length,
            totalStock: warehouse.stockItems.reduce((sum, item) => sum + item.quantity, 0),
            totalValue: warehouse.stockItems.reduce(
                (sum, item) => sum + item.quantity * Number(item.product.price || 0),
                0
            ),
        }));
    },

    /**
     * Get movement statistics
     */
    async getMovementStats(days: number = 30) {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const movements = await prisma.stockMovement.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                },
            },
            select: {
                type: true,
                quantity: true,
                createdAt: true,
            },
        });

        const inMovements = movements.filter((m) => m.type === "IN");
        const outMovements = movements.filter((m) => m.type === "OUT");

        return {
            totalMovements: movements.length,
            inCount: inMovements.length,
            outCount: outMovements.length,
            totalIn: inMovements.reduce((sum, m) => sum + m.quantity, 0),
            totalOut: outMovements.reduce((sum, m) => sum + m.quantity, 0),
        };
    },

    /**
     * Get top products by movement
     */
    async getTopProductsByMovement(limit: number = 10, days: number = 30) {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const movements = await prisma.stockMovement.groupBy({
            by: ["productId"],
            where: {
                createdAt: {
                    gte: startDate,
                },
            },
            _sum: {
                quantity: true,
            },
            _count: {
                id: true,
            },
            orderBy: {
                _count: {
                    id: "desc",
                },
            },
            take: limit,
        });

        const productsData = await Promise.all(
            movements.map(async (m) => {
                const product = await prisma.product.findUnique({
                    where: { id: m.productId },
                    select: {
                        name: true,
                        sku: true,
                        stock: true,
                    },
                });

                return {
                    productName: product?.name || "Unknown",
                    productSku: product?.sku || "",
                    currentStock: product?.stock || 0,
                    movementCount: m._count.id,
                    totalQuantity: m._sum.quantity || 0,
                };
            })
        );

        return productsData;
    },

    /**
     * Get low stock products
     */
    async getLowStockProducts() {
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    {
                        stock: {
                            lt: prisma.product.fields.minStock,
                        },
                    },
                    {
                        stock: {
                            equals: 0,
                        },
                    },
                ],
            },
            include: {
                category: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                stock: "asc",
            },
        });

        return products.map((p) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            currentStock: p.stock,
            minStock: p.minStock,
            category: p.category?.name || "Uncategorized",
            status: p.stock === 0 ? "out_of_stock" : "low_stock",
        }));
    },

    /**
     * Get recent activity
     */
    async getRecentActivity(limit: number = 10) {
        const [movements, transfers, purchases, deliveries] = await Promise.all([
            prisma.stockMovement.findMany({
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    product: {
                        select: {
                            name: true,
                        },
                    },
                    user: {
                        select: {
                            email: true,
                        },
                    },
                },
            }),
            prisma.warehouseTransfer.findMany({
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    product: {
                        select: {
                            name: true,
                        },
                    },
                },
            }),
            prisma.purchaseOrder.findMany({
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    supplier: {
                        select: {
                            name: true,
                        },
                    },
                },
            }),
            prisma.delivery.findMany({
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    institution: {
                        select: {
                            name: true,
                        },
                    },
                },
            }),
        ]);

        // Combine and sort all activities
        const activities = [
            ...movements.map((m) => ({
                type: "movement" as const,
                description: `${m.type} movement: ${m.product.name} (${m.quantity})`,
                date: m.createdAt,
                user: m.user.email,
            })),
            ...transfers.map((t) => ({
                type: "transfer" as const,
                description: `Transfer: ${t.product.name} (${t.quantity}) - ${t.status}`,
                date: t.createdAt,
                user: null,
            })),
            ...purchases.map((p) => ({
                type: "purchase" as const,
                description: `Purchase from ${p.supplier.name} - ${p.status}`,
                date: p.createdAt,
                user: null,
            })),
            ...deliveries.map((d) => ({
                type: "delivery" as const,
                description: `Delivery to ${d.institution.name} - ${d.status}`,
                date: d.createdAt,
                user: null,
            })),
        ]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, limit);

        return activities;
    },
};
