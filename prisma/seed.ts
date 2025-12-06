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
        { action: "inventory.manage", description: "Create, edit, and delete products" },
        { action: "inventory.view", description: "View products and stock levels" },

        // Warehouses
        { action: "warehouses.manage", description: "Create, edit, and delete warehouses" },
        { action: "warehouses.view", description: "View warehouses and their stock" },

        // Transfers
        { action: "transfers.manage", description: "Create, complete, and cancel warehouse transfers" },
        { action: "transfers.view", description: "View warehouse transfers" },

        // Purchases
        { action: "purchases.manage", description: "Create, edit, receive, and cancel purchase orders" },
        { action: "purchases.view", description: "View purchase orders" },

        // Deliveries
        { action: "deliveries.manage", description: "Create, confirm, deliver, and cancel deliveries" },
        { action: "deliveries.view", description: "View deliveries" },

        // Suppliers
        { action: "suppliers.manage", description: "Create, edit, and delete suppliers" },
        { action: "suppliers.view", description: "View suppliers" },

        // Institutions
        { action: "institutions.manage", description: "Create, edit, and delete institutions" },
        { action: "institutions.view", description: "View institutions" },

        // Reports & Analytics
        { action: "reports.view", description: "View all reports and analytics" },

        // Users & Roles (Admin)
        { action: "users.manage", description: "Manage users, roles, and permissions" },
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
        create: { name: "MANAGER", description: "Gestor con permisos de gestión en todos los módulos" },
    });

    const viewerRole = await prisma.role.upsert({
        where: { name: "VIEWER" },
        update: {},
        create: { name: "VIEWER", description: "Visualizador con permisos de solo lectura" },
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
