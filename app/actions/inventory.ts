"use server";

import { inventoryService } from "@/services/inventory-service";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getProducts() {
    const products = await inventoryService.getProducts();
    return products.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
    }));
}

export async function createProductAction(formData: FormData) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "inventory.create")) {
        return { error: "No tienes permisos para realizar esta acción" };
    }

    const sku = formData.get("sku") as string; // Keep sku for the service call
    const name = formData.get("name") as string;
    // const description = formData.get("description") as string; // This line was not in original createProductAction
    const price = parseFloat(formData.get("price") as string) || 0; // Default to 0 if empty
    const minStock = parseInt(formData.get("minStock") as string) || 0;
    const categoryId = formData.get("categoryId") as string;

    // Initial Stock Logic
    const initialStock = parseInt(formData.get("initialStock") as string) || 0;
    const initialWarehouseId = formData.get("initialWarehouseId") as string; // Changed from warehouseId

    if (!name || isNaN(price) || isNaN(minStock)) { // Changed validation
        return { error: "Datos inválidos" };
    }

    // Validation: if there's initial stock, must have warehouse
    if (initialStock > 0 && !initialWarehouseId) { // Changed to initialWarehouseId
        return { error: "Debe seleccionar un depósito para el stock inicial" };
    }

    try {
        await inventoryService.createProductWithInitialStock({
            sku,
            name,
            price,
            minStock,
            categoryId: categoryId || undefined,
            initialStock,
            warehouseId: initialWarehouseId || undefined,
            userId: user.id,
        });
    } catch (error) {
        console.error("Error creating product:", error);
        return { error: "Error al crear producto" };
    }

    revalidatePath("/dashboard/inventory");
    if (initialWarehouseId) {
        revalidatePath("/dashboard/warehouses");
        revalidatePath(`/dashboard/warehouses/${initialWarehouseId}`);
    }
    redirect("/dashboard/inventory");
}

export async function updateProductAction(id: string, formData: FormData) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "inventory.manage")) {
        return { error: "No tienes permisos para realizar esta acción" };
    }

    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string) || 0;
    const minStock = parseInt(formData.get("minStock") as string) || 0;
    const categoryId = formData.get("categoryId") as string;

    try {
        await inventoryService.updateProduct(id, {
            name,
            price: isNaN(price) ? undefined : price,
            minStock: isNaN(minStock) ? undefined : minStock,
            categoryId: categoryId || undefined,
        });

        const newStock = parseInt(formData.get("stock") as string);
        if (!isNaN(newStock)) {
            // Check current stock to see if we need an adjustment
            // We need to fetch the product again or trust the change?
            // Safer to fetch current stock to calculate difference correctly.
            const product = await inventoryService.getProduct(id);
            if (product && product.stock !== newStock) {
                const diff = newStock - product.stock;
                // If diff > 0, we add (IN/ADJUSTMENT)
                // If diff < 0, we subtract (OUT/ADJUSTMENT)
                // registerMovement logic: IN adds, OUT subtracts. ADJUSTMENT allows signed logic if we implemented it, 
                // but our implementation checks type.

                // Let's use "ADJUSTMENT" type but we need to handle the sign logic in service or pass correct params.
                // Service logic for ADJUSTMENT: newStock += quantity.
                // So if diff is negative, we pass negative quantity? Or does it expect absolute?
                // Our recent service text said:
                // if (type === "ADJUSTMENT") { newStock += quantity; }
                // So we can pass the signed difference directly with type ADJUSTMENT.

                await inventoryService.registerMovement({
                    productId: id,
                    type: "ADJUSTMENT",
                    quantity: diff, // Signed integer
                    userId: user.id,
                    reason: "Corrección manual desde Edición de Producto",
                });
            }
        }
    } catch (error) {
        return { error: "Error al actualizar producto" };
    }

    revalidatePath(`/dashboard/inventory/${id}`);
    revalidatePath("/dashboard/inventory");
    redirect("/dashboard/inventory");
}

export async function deleteProductAction(id: string) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "inventory.manage")) {
        return { error: "No tienes permisos para eliminar" };
    }

    try {
        await inventoryService.deleteProduct(id);
    } catch (error) {
        return { error: "Error al eliminar producto (puede tener movimientos asociados)" };
    }

    revalidatePath("/dashboard/inventory");
    return { success: true };
}

export async function createCategoryAction(formData: FormData) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "inventory.manage")) {
        return { error: "No tienes permisos para gestionar categorías" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if (!name) {
        return { error: "El nombre es requerido" };
    }

    try {
        await inventoryService.createCategory(name, description);
    } catch (error) {
        return { error: "Error al crear categoría" };
    }

    revalidatePath("/dashboard/inventory/create");
    revalidatePath("/dashboard/categories");
    return { success: true };
}
