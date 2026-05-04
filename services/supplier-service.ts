import prisma from "@/lib/prisma";

export const supplierService = {
    // ==================== SUPPLIER CRUD ====================

    /**
     * Get all suppliers
     */
    async getSuppliers() {
        return await prisma.supplier.findMany({
            where: { deletedAt: null },
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: {
                        purchaseOrders: true,
                        receipts: true,
                    },
                },
            },
        });
    },

    /**
     * Get a single supplier with details
     */
    async getSupplier(id: string) {
        const supplier = await prisma.supplier.findUnique({
            where: { id, deletedAt: null },
            include: {
                purchaseOrders: {
                    take: 10,
                    orderBy: { createdAt: "desc" },
                    include: {
                        warehouse: true,
                        _count: {
                            select: {
                                items: true,
                            },
                        },
                    },
                },
                receipts: {
                    take: 10,
                    orderBy: { date: "desc" },
                    include: {
                        warehouse: true,
                        _count: {
                            select: {
                                items: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        purchaseOrders: true,
                        receipts: true,
                    },
                },
            },
        });

        if (supplier) {
            return {
                ...supplier,
                receipts: supplier.receipts.map(r => ({
                    ...r,
                    totalAmount: r.totalAmount.toString(),
                })),
            };
        }
        return supplier;
    },

    /**
     * Create a new supplier
     */
    async createSupplier(data: {
        name: string;
        code: string;
        email?: string;
        phone?: string;
        address?: string;
        contactName?: string;
        notes?: string;
    }) {
        return await prisma.supplier.create({
            data,
        });
    },

    /**
     * Update supplier information
     */
    async updateSupplier(
        id: string,
        data: {
            name?: string;
            code?: string;
            email?: string;
            phone?: string;
            address?: string;
            contactName?: string;
            notes?: string;
        }
    ) {
        return await prisma.supplier.update({
            where: { id },
            data,
        });
    },

    /**
     * Toggle supplier active status
     */
    async toggleSupplierStatus(id: string) {
        const supplier = await prisma.supplier.findUnique({
            where: { id },
            select: { isActive: true },
        });

        if (!supplier) throw new Error("Proveedor no encontrado");

        return await prisma.supplier.update({
            where: { id },
            data: { isActive: !supplier.isActive },
        });
    },

    /**
     * Delete supplier (only if no purchase orders)
     */
    async deleteSupplier(id: string) {
        return await prisma.supplier.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    },

    /**
     * Get supplier statistics
     */
    async getSupplierStats(id: string) {
        const [totalOrders, totalSpent, pendingOrders] = await Promise.all([
            prisma.purchaseOrder.count({
                where: { supplierId: id, deletedAt: null },
            }),
            prisma.purchaseOrder.aggregate({
                where: {
                    supplierId: id,
                    status: "RECEIVED",
                    deletedAt: null,
                },
                _sum: {
                    totalAmount: true,
                },
            }),
            prisma.purchaseOrder.count({
                where: {
                    supplierId: id,
                    status: "DRAFT",
                    deletedAt: null,
                },
            }),
        ]);

        return {
            totalOrders,
            totalSpent: totalSpent._sum.totalAmount || 0,
            pendingOrders,
        };
    },
};
