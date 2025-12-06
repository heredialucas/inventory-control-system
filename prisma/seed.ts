import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Define permissions
    const permissions = [
        { action: "inventory.view", description: "Ver inventario" },
        { action: "inventory.create", description: "Crear productos" },
        { action: "inventory.edit", description: "Editar productos" },
        { action: "inventory.delete", description: "Eliminar productos" },
    ];

    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: { action: perm.action },
            update: {},
            create: perm,
        });
    }

    // Create Roles
    const adminRole = await prisma.role.upsert({
        where: { name: "ADMIN" },
        update: {},
        create: { name: "ADMIN", description: "Administrador del sistema" },
    });

    const managerRole = await prisma.role.upsert({
        where: { name: "MANAGER" },
        update: {},
        create: { name: "MANAGER", description: "Gestor de inventario" },
    });

    const viewerRole = await prisma.role.upsert({
        where: { name: "VIEWER" },
        update: {},
        create: { name: "VIEWER", description: "Visualizador" },
    });

    // Assign Permissions to Roles
    const allPermissions = await prisma.permission.findMany();

    // ADMIN gets everything
    for (const p of allPermissions) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: adminRole.id,
                    permissionId: p.id
                }
            },
            update: {},
            create: {
                roleId: adminRole.id,
                permissionId: p.id
            }
        });
    }

    // MANAGER gets inventory.*
    const inventoryPermissions = allPermissions.filter(p => p.action.startsWith("inventory."));
    for (const p of inventoryPermissions) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: managerRole.id,
                    permissionId: p.id
                }
            },
            update: {},
            create: {
                roleId: managerRole.id,
                permissionId: p.id
            }
        });
    }

    // VIEWER gets inventory.view
    const viewPermission = allPermissions.find(p => p.action === "inventory.view");
    if (viewPermission) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: viewerRole.id,
                    permissionId: viewPermission.id
                }
            },
            update: {},
            create: {
                roleId: viewerRole.id,
                permissionId: viewPermission.id
            }
        });
    }

    console.log("Seeding completed.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
