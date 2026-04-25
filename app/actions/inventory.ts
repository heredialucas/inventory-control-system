"use server";

import { inventoryService } from "@/services/inventory-service";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Extrae el publicId de una URL de Cloudinary
 */
function extractPublicIdFromCloudinaryUrl(url: string): string | null {
    try {
        const urlParts = url.split('/upload/');
        if (urlParts.length < 2) return null;

        const pathAfterUpload = urlParts[1];
        const pathSegments = pathAfterUpload.split('/');

        // Buscar el inicio de la carpeta (después de versión o transformaciones)
        const folderIndex = pathSegments.findIndex(
            seg => seg === 'inventory-control' || (!seg.startsWith('v') && !seg.includes(','))
        );

        if (folderIndex === -1) return null;

        // Tomar desde la carpeta hasta el final
        const relevantSegments = pathSegments.slice(folderIndex);
        const fileName = relevantSegments[relevantSegments.length - 1];
        const fileNameWithoutExt = fileName.split('.')[0];
        relevantSegments[relevantSegments.length - 1] = fileNameWithoutExt;

        return relevantSegments.join('/');
    } catch (error) {
        console.error('Error extracting publicId:', error);
        return null;
    }
}

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
    const unit = formData.get("unit") as string || "U";

    // Manejar archivo de imagen - es un File object, no una string
    const receiptImageFile = formData.get("receiptImageUrl") as File | null;
    let receiptImageUrl: string | undefined = undefined;

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
        // Si hay un archivo de imagen, convertirlo a base64 y subirlo
        if (receiptImageFile && receiptImageFile.size > 0) {
            const arrayBuffer = await receiptImageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = buffer.toString('base64');
            const dataUrl = `data:${receiptImageFile.type};base64,${base64}`;

            // Importar dinámicamente la función de upload
            const { uploadImage } = await import('./cloudinary');
            const uploadResult = await uploadImage(dataUrl, 'products');

            if (uploadResult.success && uploadResult.url) {
                receiptImageUrl = uploadResult.url;
            }
        }

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

    // redirect() debe estar FUERA del try-catch: Next.js lanza NEXT_REDIRECT
    // internamente y si es capturado por catch, la navegación falla.
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
    const unit = formData.get("unit") as string || "U";

    // Campos de compra
    const purchaseCode = formData.get("purchaseCode") as string || undefined;
    const purchaseDateStr = formData.get("purchaseDate") as string;
    const purchaseDate = purchaseDateStr ? new Date(purchaseDateStr) : undefined;
    const purchaseAmount = parseFloat(formData.get("purchaseAmount") as string) || undefined;
    const supplierId = formData.get("supplierId") as string || undefined;
    const destination = formData.get("destination") as string || undefined;

    // Manejar imagen
    const receiptImageFile = formData.get("receiptImageUrl") as File | null;
    const existingImageUrl = formData.get("existingReceiptImageUrl") as string || undefined;
    let receiptImageUrl: string | undefined = existingImageUrl;

    try {
        // Si hay un nuevo archivo de imagen, procesarlo
        if (receiptImageFile && receiptImageFile.size > 0) {
            const arrayBuffer = await receiptImageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = buffer.toString('base64');
            const dataUrl = `data:${receiptImageFile.type};base64,${base64}`;

            // Importar dinámicamente la función de upload/update
            const { uploadImage, updateImage } = await import('./cloudinary');

            // Si existe una imagen previa, intentar actualizarla
            if (existingImageUrl) {
                const oldPublicId = extractPublicIdFromCloudinaryUrl(existingImageUrl);

                if (oldPublicId) {
                    const updateResult = await updateImage(dataUrl, oldPublicId, 'products');
                    if (updateResult.success && updateResult.url) {
                        receiptImageUrl = updateResult.url;
                    } else {
                        // Si falla la actualización, intentar subir como nueva
                        const uploadResult = await uploadImage(dataUrl, 'products');
                        if (uploadResult.success && uploadResult.url) {
                            receiptImageUrl = uploadResult.url;
                        }
                    }
                } else {
                    // No pudimos extraer el publicId, subir como nueva
                    const uploadResult = await uploadImage(dataUrl, 'products');
                    if (uploadResult.success && uploadResult.url) {
                        receiptImageUrl = uploadResult.url;
                    }
                }
            } else {
                // No hay imagen previa, subir como nueva
                const uploadResult = await uploadImage(dataUrl, 'products');
                if (uploadResult.success && uploadResult.url) {
                    receiptImageUrl = uploadResult.url;
                }
            }
        }

        await inventoryService.updateProduct(id, {
            name,
            price: isNaN(price) ? undefined : price,
            minStock: isNaN(minStock) ? undefined : minStock,
            categoryId: categoryId || undefined,
            unit,
            purchaseCode,
            purchaseDate,
            purchaseAmount,
            supplierId,
            destination,
            receiptImageUrl,
        });

        const newStock = parseInt(formData.get("stock") as string);
        if (!isNaN(newStock)) {
            const product = await inventoryService.getProduct(id);
            if (product && product.stock !== newStock) {
                const diff = newStock - product.stock;
                // ADJUSTMENT suma quantity con signo: positivo agrega, negativo resta
                await inventoryService.registerMovement({
                    productId: id,
                    type: "ADJUSTMENT",
                    quantity: diff,
                    userId: user.id,
                    reason: "Corrección manual desde Edición de Producto",
                });
            }
        }
    } catch (error) {
        console.error("Error updating product:", error);
        return { error: "Error al actualizar producto" };
    }

    // redirect() debe estar FUERA del try-catch
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
    if (!user || !hasPermission(user, "inventory.manage") || !hasPermission(user, "categories.manage")) {
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

export async function updateCategoryAction(id: string, formData: FormData) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "inventory.manage") || !hasPermission(user, "categories.manage")) {
        return { error: "No tienes permisos para gestionar categorías" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if (!name) {
        return { error: "El nombre es requerido" };
    }

    try {
        await inventoryService.updateCategory(id, name, description);
    } catch (error) {
        return { error: "Error al actualizar categoría" };
    }

    revalidatePath("/dashboard/categories");
    return { success: true };
}

export async function deleteCategoryAction(id: string) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "inventory.manage") || !hasPermission(user, "categories.manage")) {
        return { error: "No tienes permisos para eliminar categorías" };
    }

    try {
        await inventoryService.deleteCategory(id);
    } catch (error) {
        return { error: "Error al eliminar categoría" };
    }

    revalidatePath("/dashboard/categories");
    return { success: true };
}
