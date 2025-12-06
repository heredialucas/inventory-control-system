import prisma from "@/lib/prisma";

export const supplierService = {
    // ==================== SUPPLIER CRUD ====================

    /**
     * Get all suppliers
     */
    async getSuppliers() {
        return await prisma.supplier.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: {
                        purchaseOrders: true,
                    },
                },
            },
        });
    },

    /**
     * Get a single supplier with details
     */
    async getSupplier(id: string) {
        return await prisma.supplier.findUnique({
            where: { id },
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
                _count: {
                    select: {
                        purchaseOrders: true,
                    },
                },
            },
        });
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

        if (!supplier) throw new Error("Supplier not found");

        return await prisma.supplier.update({
            where: { id },
            data: { isActive: !supplier.isActive },
        });
    },

    /**
     * Delete supplier (only if no purchase orders)
     */
    async deleteSupplier(id: string) {
        const ordersCount = await prisma.purchaseOrder.count({
            where: { supplierId: id },
        });

        if (ordersCount > 0) {
            throw new Error(
                "Cannot delete supplier with existing purchase orders"
            );
        }

        return await prisma.supplier.delete({
            where: { id },
        });
    },

    /**
     * Get supplier statistics
     */
    async getSupplierStats(id: string) {
        const [totalOrders, totalSpent, pendingOrders] = await Promise.all([
            prisma.purchaseOrder.count({
                where: { supplierId: id },
            }),
            prisma.purchaseOrder.aggregate({
                where: {
                    supplierId: id,
                    status: { in: ["RECEIVED", "PARTIAL"] },
                },
                _sum: {
                    totalAmount: true,
                },
            }),
            prisma.purchaseOrder.count({
                where: {
                    supplierId: id,
                    status: { in: ["DRAFT", "PENDING"] },
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
