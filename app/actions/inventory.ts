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
    if (!user || !hasPermission(user, "inventory.manage")) {
        return { error: "No tienes permisos para realizar esta acción" };
    }

    const sku = formData.get("sku") as string;
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string) || 0;
    const minStock = parseInt(formData.get("minStock") as string) || 0;
    const categoryId = formData.get("categoryId") as string;

    // Lógica de Stock Inicial
    const initialStock = parseInt(formData.get("initialStock") as string) || 0;
    const initialWarehouseId = formData.get("initialWarehouseId") as string;

    // Nuevos campos de compra
    const purchaseCode = formData.get("purchaseCode") as string || undefined;
    const purchaseDateStr = formData.get("purchaseDate") as string;
    const purchaseDate = purchaseDateStr ? new Date(purchaseDateStr) : undefined;
    const purchaseAmount = parseFloat(formData.get("purchaseAmount") as string) || undefined;
    const supplierId = formData.get("supplierId") as string || undefined;
    const destination = formData.get("destination") as string || undefined;
    const receiptImageUrl = formData.get("receiptImageUrl") as string || undefined;
    const unit = formData.get("unit") as string || "U";

    if (!name || isNaN(price) || isNaN(minStock)) {
        return { error: "Datos inválidos" };
    }

    // Validación: El stock inicial es obligatorio y debe ser positivo
    if (initialStock <= 0) {
        return { error: "El stock inicial debe ser mayor a 0" };
    }
    if (!initialWarehouseId) {
        return { error: "Debe seleccionar un depósito para el stock inicial" };
    }

    try {
        await inventoryService.createProductWithInitialStock({
            sku,
            name,
            price,
            unit,
            minStock,
            categoryId: categoryId || undefined,
            initialStock,
            warehouseId: initialWarehouseId || undefined,
            userId: user.id,
            // Nuevos campos
            purchaseCode,
            purchaseDate,
            purchaseAmount,
            supplierId,
            destination,
            receiptImageUrl,
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
            // Verificar stock actual para ver si necesitamos un ajuste
            // ¿Necesitamos obtener el producto nuevamente o confiar en el cambio?
            // Más seguro obtener el stock actual para calcular la diferencia correctamente.
            const product = await inventoryService.getProduct(id);
            if (product && product.stock !== newStock) {
                const diff = newStock - product.stock;
                // Si diff > 0, agregamos (IN/ADJUSTMENT)
                // Si diff < 0, restamos (OUT/ADJUSTMENT)
                // Lógica de registerMovement: IN suma, OUT resta. ADJUSTMENT permite lógica con signo si la implementamos,
                // pero nuestra implementación verifica el tipo.

                // Usemos tipo "ADJUSTMENT" pero necesitamos manejar la lógica del signo en el servicio o pasar parámetros correctos.
                // Lógica del servicio para ADJUSTMENT: newStock += quantity.
                // Entonces si diff es negativo, ¿pasamos quantity negativa? ¿O espera absoluto?
                // Nuestro texto reciente del servicio dijo:
                // if (type === "ADJUSTMENT") { newStock += quantity; }
                // Así que podemos pasar la diferencia con signo directamente con tipo ADJUSTMENT.

                await inventoryService.registerMovement({
                    productId: id,
                    type: "ADJUSTMENT",
                    quantity: diff, // Entero con signo
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
