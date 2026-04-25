import prisma from "@/lib/prisma";

export const roleService = {
    async getRoles() {
        return await prisma.role.findMany({
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
                _count: {
                    select: { users: true },
                },
            },
            orderBy: { createdAt: "asc" },
        });
    },

    async getPermissions() {
        return await prisma.permission.findMany({
            orderBy: { action: "asc" },
        });
    },

    async createRole(name: string, description?: string, permissionIds: string[] = []) {
        // Ensure users.view is always included
        const usersViewPerm = await prisma.permission.findUnique({
            where: { action: "users.view" }
        });

        const finalPermissionIds = [...permissionIds];
        if (usersViewPerm && !finalPermissionIds.includes(usersViewPerm.id)) {
            finalPermissionIds.push(usersViewPerm.id);
        }

        return await prisma.role.create({
            data: {
                name,
                description,
                permissions: {
                    create: finalPermissionIds.map((id) => ({
                        permission: { connect: { id } },
                    })),
                },
            },
        });
    },

    async updateRole(id: string, name: string, description?: string, permissionIds: string[] = []) {
        // Ensure users.view is always included
        const usersViewPerm = await prisma.permission.findUnique({
            where: { action: "users.view" }
        });

        const finalPermissionIds = [...permissionIds];
        if (usersViewPerm && !finalPermissionIds.includes(usersViewPerm.id)) {
            finalPermissionIds.push(usersViewPerm.id);
        }

        // Transaction to update role and permissions safely
        return await prisma.$transaction(async (tx) => {
            // update basic info
            const role = await tx.role.update({
                where: { id },
                data: { name, description },
            });

            // delete existing permissions connections
            await tx.rolePermission.deleteMany({
                where: { roleId: id },
            });

            // create new permissions connections
            if (finalPermissionIds.length > 0) {
                await tx.rolePermission.createMany({
                    data: finalPermissionIds.map((pId) => ({
                        roleId: id,
                        permissionId: pId,
                    })),
                });
            }

            return role;
        });
    },

    async deleteRole(id: string) {
        return await prisma.role.delete({
            where: { id },
        });
    },

    async createPermission(action: string, description?: string) {
        return await prisma.permission.create({
            data: { action, description }
        });
    }
};
