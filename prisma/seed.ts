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
    console.log("🌱 Starting database seeding...");

    // ==================== SEED PERMISSIONS ====================
    console.log("🔐 Seeding permissions...");

    const permissions = [
        // Inventory & Products
        { action: "inventory.manage", description: "Crear, editar y eliminar productos" },
        { action: "inventory.view", description: "Ver productos y niveles de stock" },

        // Warehouses
        { action: "warehouses.manage", description: "Crear, editar y eliminar almacenes" },
        { action: "warehouses.view", description: "Ver almacenes y su stock" },

        // Transfers
        { action: "transfers.manage", description: "Crear, completar y cancelar transferencias entre almacenes" },
        { action: "transfers.view", description: "Ver transferencias entre almacenes" },

        // Purchases
        { action: "purchases.manage", description: "Crear, editar, recibir y cancelar órdenes de compra" },
        { action: "purchases.view", description: "Ver órdenes de compra" },

        // Deliveries
        { action: "deliveries.manage", description: "Crear, confirmar, entregar y cancelar entregas" },
        { action: "deliveries.view", description: "Ver entregas" },

        // Suppliers
        { action: "suppliers.manage", description: "Crear, editar y eliminar proveedores" },
        { action: "suppliers.view", description: "Ver proveedores" },

        // Institutions
        { action: "institutions.manage", description: "Crear, editar y eliminar instituciones" },
        { action: "institutions.view", description: "Ver instituciones" },

        // Reports & Analytics
        { action: "reports.view", description: "Ver todos los reportes y análisis" },

        // Users & Roles (Admin)
        { action: "users.manage", description: "Gestionar usuarios, roles y permisos" },
    ];

    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: { action: perm.action },
            update: { description: perm.description },
            create: perm,
        });
    }

    console.log(`✅ Seeded ${permissions.length} permissions`);

    // ==================== CREATE ROLES ====================
    console.log("👥 Seeding roles...");

    const adminRole = await prisma.role.upsert({
        where: { name: "ADMIN" },
        update: {},
        create: { name: "ADMIN", description: "Administrador del sistema con todos los permisos" },
    });

    const managerRole = await prisma.role.upsert({
        where: { name: "MANAGER" },
        update: {},
        create: { name: "MANAGER", description: "Encargado con permisos de gestión en todos los módulos" },
    });

    const viewerRole = await prisma.role.upsert({
        where: { name: "VIEWER" },
        update: {},
        create: { name: "VIEWER", description: "Empleado con permisos de solo lectura" },
    });

    console.log("✅ Seeded 3 roles");

    // ==================== ASSIGN PERMISSIONS TO ROLES ====================
    console.log("🔗 Assigning permissions to roles...");

    const allPermissions = await prisma.permission.findMany();

    // ADMIN gets all permissions
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

    // MANAGER gets all manage permissions + all view permissions
    const managePermissions = allPermissions.filter(p => p.action.endsWith(".manage"));
    const viewPermissions = allPermissions.filter(p => p.action.endsWith(".view"));
    for (const p of [...managePermissions, ...viewPermissions]) {
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

    // VIEWER gets only view permissions
    for (const p of viewPermissions) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: viewerRole.id,
                    permissionId: p.id
                }
            },
            update: {},
            create: {
                roleId: viewerRole.id,
                permissionId: p.id
            }
        });
    }

    console.log("✅ Assigned permissions to roles");

    // ==================== CREATE DEFAULT WAREHOUSE ====================
    console.log("🏭 Creating default warehouse...");

    const defaultWarehouse = await prisma.warehouse.upsert({
        where: { code: "WH-MAIN" },
        update: {},
        create: {
            name: "Depósito Principal",
            code: "WH-MAIN",
            description: "Depósito principal del sistema",
            address: "Sede central",
            isActive: true,
        },
    });

    console.log(`✅ Default warehouse created: ${defaultWarehouse.name}`);

    // ==================== MIGRATE EXISTING PRODUCTS ====================
    console.log("📦 Migrating existing product stock to default warehouse...");

    const products = await prisma.product.findMany();
    let migratedCount = 0;

    for (const product of products) {
        if (product.stock > 0) {
            await prisma.warehouseStock.upsert({
                where: {
                    warehouseId_productId: {
                        warehouseId: defaultWarehouse.id,
                        productId: product.id,
                    },
                },
                update: {},
                create: {
                    warehouseId: defaultWarehouse.id,
                    productId: product.id,
                    quantity: product.stock,
                },
            });
            migratedCount++;
        }
    }

    console.log(`✅ Migrated ${migratedCount} products to default warehouse`);

    console.log("✅ Database seeding completed!");
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
