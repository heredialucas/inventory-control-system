import prisma from "@/lib/prisma";

export const institutionService = {
    /**
     * Get all institutions
     */
    async getInstitutions() {
        return await prisma.institution.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: {
                        deliveries: true,
                    },
                },
            },
        });
    },

    /**
     * Get a single institution
     */
    async getInstitution(id: string) {
        return await prisma.institution.findUnique({
            where: { id },
            include: {
                deliveries: {
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
                        deliveries: true,
                    },
                },
            },
        });
    },

    /**
     * Create a new institution
     */
    async createInstitution(data: {
        name: string;
        code: string;
        type?: string;
        contactName?: string;
        email?: string;
        phone?: string;
        address?: string;
        notes?: string;
    }) {
        return await prisma.institution.create({
            data,
        });
    },

    /**
     * Update institution
     */
    async updateInstitution(
        id: string,
        data: {
            name?: string;
            code?: string;
            type?: string;
            contactName?: string;
            email?: string;
            phone?: string;
            address?: string;
            notes?: string;
        }
    ) {
        return await prisma.institution.update({
            where: { id },
            data,
        });
    },

    /**
     * Toggle institution status
     */
    async toggleInstitutionStatus(id: string) {
        const institution = await prisma.institution.findUnique({
            where: { id },
            select: { isActive: true },
        });

        if (!institution) throw new Error("Institution not found");

        return await prisma.institution.update({
            where: { id },
            data: { isActive: !institution.isActive },
        });
    },

    /**
     * Delete institution
     */
    async deleteInstitution(id: string) {
        const deliveriesCount = await prisma.delivery.count({
            where: { institutionId: id },
        });

        if (deliveriesCount > 0) {
            throw new Error("Cannot delete institution with existing deliveries");
        }

        return await prisma.institution.delete({
            where: { id },
        });
    },
};
