"use server";

import { supplierService } from "@/services/supplier-service";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getSuppliers() {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "suppliers.view")) {
        throw new Error("No tienes permisos para ver proveedores");
    }

    try {
        return await supplierService.getSuppliers();
    } catch (error) {
        console.error("Error getting suppliers:", error);
        throw new Error("Failed to fetch suppliers");
    }
}

export async function getSupplier(id: string) {
    try {
        return await supplierService.getSupplier(id);
    } catch (error) {
        console.error("Error getting supplier:", error);
        throw new Error("Failed to fetch supplier");
    }
}

export async function createSupplier(data: {
    name: string;
    code: string;
    email?: string;
    phone?: string;
    address?: string;
    contactName?: string;
    notes?: string;
}) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "suppliers.manage")) {
        throw new Error("No tienes permisos para crear proveedores");
    }

    try {
        const supplier = await supplierService.createSupplier(data);
        revalidatePath("/dashboard/suppliers");
        return supplier;
    } catch (error: any) {
        console.error("Error creating supplier:", error);
        if (error.code === "P2002") {
            throw new Error("Supplier code already exists");
        }
        throw new Error("Failed to create supplier");
    }
}

export async function updateSupplier(
    id: string,
    data: {
        name?: string;
        code?: string;
        email?: string;
        phone?: string;
        address?: string;
        contactName?: string;
        notes?: string;
    }
) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "suppliers.manage")) {
        throw new Error("No tienes permisos para editar proveedores");
    }

    try {
        const supplier = await supplierService.updateSupplier(id, data);
        revalidatePath("/dashboard/suppliers");
        revalidatePath(`/dashboard/suppliers/${id}`);
        return supplier;
    } catch (error: any) {
        console.error("Error updating supplier:", error);
        if (error.code === "P2002") {
            throw new Error("Supplier code already exists");
        }
        throw new Error("Failed to update supplier");
    }
}

export async function toggleSupplierStatus(id: string) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "suppliers.manage")) {
        throw new Error("No tienes permisos para cambiar estado de proveedores");
    }

    try {
        const supplier = await supplierService.toggleSupplierStatus(id);
        revalidatePath("/dashboard/suppliers");
        revalidatePath(`/dashboard/suppliers/${id}`);
        return supplier;
    } catch (error) {
        console.error("Error toggling supplier status:", error);
        throw new Error("Failed to update supplier status");
    }
}

export async function deleteSupplier(id: string) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "suppliers.manage")) {
        throw new Error("No tienes permisos para eliminar proveedores");
    }

    try {
        await supplierService.deleteSupplier(id);
        revalidatePath("/dashboard/suppliers");
    } catch (error: any) {
        console.error("Error deleting supplier:", error);
        throw new Error(error.message || "Failed to delete supplier");
    }
}

export async function getSupplierStats(id: string) {
    try {
        return await supplierService.getSupplierStats(id);
    } catch (error) {
        console.error("Error getting supplier stats:", error);
        throw new Error("Failed to fetch supplier statistics");
    }
}
