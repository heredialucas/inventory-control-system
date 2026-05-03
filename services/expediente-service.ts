import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const expedienteService = {
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
        }
    ) {
        return await prisma.expediente.update({
            where: { id },
            data,
        });
    },
};
