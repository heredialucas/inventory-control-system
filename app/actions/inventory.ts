"use server";

import { inventoryService } from "@/services/inventory-service";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProductAction(formData: FormData) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "inventory.create")) {
        return { error: "No tienes permisos para realizar esta acción" };
    }

    const sku = formData.get("sku") as string;
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const minStock = parseInt(formData.get("minStock") as string) || 0;
    const categoryId = formData.get("categoryId") as string;

    if (!sku || !name || isNaN(price)) {
        return { error: "Datos inválidos" };
    }

    try {
        await inventoryService.createProduct({
            sku,
            name,
            price,
            minStock,
            categoryId: categoryId || undefined,
        });
    } catch (error) {
        return { error: "Error al crear producto" };
    }

    revalidatePath("/dashboard/inventory");
    redirect("/dashboard/inventory");
}

export async function updateProductAction(id: string, formData: FormData) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "inventory.edit")) {
        return { error: "No tienes permisos para realizar esta acción" };
    }

    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const minStock = parseInt(formData.get("minStock") as string);
    const categoryId = formData.get("categoryId") as string;

    try {
        await inventoryService.updateProduct(id, {
            name,
            price: isNaN(price) ? undefined : price,
            minStock: isNaN(minStock) ? undefined : minStock,
            categoryId: categoryId || undefined,
        });
    } catch (error) {
        return { error: "Error al actualizar producto" };
    }

    revalidatePath(`/dashboard/inventory/${id}`);
    revalidatePath("/dashboard/inventory");
    redirect("/dashboard/inventory");
}

export async function deleteProductAction(id: string) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "inventory.delete")) {
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
