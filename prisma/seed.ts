import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Start seeding...");

    // 1. Define Permissions
    const permissions = [
        // Dashboard / General
        { action: "dashboard.view", description: "Ver el dashboard principal" },

        // Inventory
        { action: "inventory.view", description: "Ver inventario" },
        { action: "inventory.create", description: "Crear/Editar productos" },
        { action: "inventory.delete", description: "Eliminar productos" },

        // Users (Management)
        { action: "users.view", description: "Ver usuarios y roles" },
        { action: "users.create", description: "Crear/Editar usuarios y roles" },
        { action: "users.delete", description: "Eliminar usuarios" },
    ];

    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: { action: perm.action },
            update: {},
            create: perm,
        });
    }

    const allPerms = await prisma.permission.findMany();

    // 2. Define Roles
    const roles = [
        {
            name: "Administrador",
            description: "Acceso total al sistema",
            permissions: allPerms.map(p => p.id), // All permissions
        },
        {
            name: "Encargado",
            description: "Gestión de inventario y ver dashboard",
            permissions: allPerms
                .filter(p => ["dashboard.view", "inventory.view", "inventory.create", "inventory.delete"].includes(p.action))
                .map(p => p.id),
        },
        {
            name: "Observador",
            description: "Solo ver inventario y dashboard",
            permissions: allPerms
                .filter(p => ["dashboard.view", "inventory.view"].includes(p.action))
                .map(p => p.id),
        },
    ];

    for (const role of roles) {
        const existingRole = await prisma.role.findUnique({
            where: { name: role.name }
        });

        if (existingRole) {
            console.log(`Role ${role.name} already exists.`);
        } else {
            await prisma.role.create({
                data: {
                    name: role.name,
                    description: role.description,
                    permissions: {
                        create: role.permissions.map(pid => ({
                            permission: { connect: { id: pid } }
                        }))
                    }
                }
            });
            console.log(`Created role: ${role.name}`);
        }
    }

    // 3. Assign Admin Role to specific user
    const targetEmail = "heredialucasfac22@gmail.com";
    const user = await prisma.user.findUnique({
        where: { email: targetEmail }
    });

    if (user) {
        const adminRole = await prisma.role.findUnique({
            where: { name: "Administrador" }
        });

        if (adminRole) {
            // Check if user already has the role
            const userRole = await prisma.userRole.findUnique({
                where: {
                    userId_roleId: {
                        userId: user.id,
                        roleId: adminRole.id
                    }
                }
            });

            if (!userRole) {
                await prisma.userRole.create({
                    data: {
                        userId: user.id,
                        roleId: adminRole.id
                    }
                });
                console.log(`Assigned 'Administrador' role to ${targetEmail}`);
            } else {
                console.log(`User ${targetEmail} already has 'Administrador' role`);
            }
        }
    } else {
        console.warn(`User with email ${targetEmail} not found. Skipping role assignment.`);
    }

    console.log("Seeding finished.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
