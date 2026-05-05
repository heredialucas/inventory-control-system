import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const expedienteService = {
    // ==================== CATEGORÍAS DE EXPEDIENTE ====================

    async getExpedienteCategories() {
        return await prisma.expedienteCategory.findMany({
            where: { deletedAt: null },
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: { expedientes: true },
                },
            },
        });
    },

    async createExpedienteCategory(name: string, description?: string) {
        return await prisma.expedienteCategory.create({
            data: { name, description },
        });
    },

    async updateExpedienteCategory(id: string, name: string, description?: string) {
        return await prisma.expedienteCategory.update({
            where: { id },
            data: { name, description },
        });
    },

    async deleteExpedienteCategory(id: string) {
        return await prisma.expedienteCategory.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    },

    // ==================== EXPEDIENTES ====================

    /**
     * Get all expedientes with optional filters
     */
    async getExpedientes(filters?: {
        status?: string;
    }) {
        const where: Prisma.ExpedienteWhereInput = {};

        if (filters?.status) {
            where.status = filters.status;
        }

        return await prisma.expediente.findMany({
            where,
            include: {
                _count: {
                    select: {
                        purchases: true,
                        deliveries: true,
                        transfers: true,
                        movements: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    },

    /**
     * Get a single expediente with full deep relations (The "Full" view)
     */
    async getExpediente(id: string) {
        return await prisma.expediente.findUnique({
            where: { id },
            include: {
                purchases: {
                    include: {
                        supplier: true,
                        items: {
                            include: {
                                product: true
                            }
                        },
                        receipts: true
                    },
                    orderBy: { createdAt: 'desc' }
                },
                deliveries: {
                    include: {
                        institution: true,
                        items: {
                            include: {
                                product: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                transfers: {
                    include: {
                        fromWarehouse: true,
                        toWarehouse: true,
                        product: true
                    },
                    orderBy: { createdAt: 'desc' }
                },
                movements: {
                    include: {
                        product: true,
                        warehouse: true,
                        user: {
                            select: {
                                id: true,
                                email: true,
                                username: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                receipts: {
                    include: {
                        purchaseOrder: {
                            include: {
                                warehouse: true
                            }
                        },
                        warehouse: true,
                        items: {
                            include: {
                                product: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            },
        });
    },

    /**
     * Create a new expediente
     */
    async createExpediente(data: {
        number?: string;
        year?: number;
        type?: string;
        origin?: string;
        description?: string;
        status?: string;
        categoryId?: string;
    }) {
        // Use provided number or generate one (e.g. EXP-000001)
        let number = data.number;
        if (!number) {
            const count = await prisma.expediente.count();
            number = `EXP-${String(count + 1).padStart(6, "0")}`;
        }

        return await prisma.expediente.create({
            data: {
                number,
                year: data.year,
                type: data.type,
                origin: data.origin,
                description: data.description,
                status: data.status || "ABIERTO",
                categoryId: data.categoryId,
            },
        });
    },

    /**
     * Update an expediente
     */
    async updateExpediente(
        id: string,
        data: {
            number?: string;
            year?: number;
            type?: string;
            origin?: string;
            description?: string;
            status?: string;
            categoryId?: string;
        }
    ) {
        return await prisma.expediente.update({
            where: { id },
            data,
        });
    },
};
