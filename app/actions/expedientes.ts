"use server";

import { expedienteService } from "@/services/expediente-service";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { serializePrisma } from "@/lib/utils";

async function verifyPermission(permissions: string | string[]) {
    const user = await getCurrentUser();
    if (!user) throw new Error("No autenticado");
    
    const perms = Array.isArray(permissions) ? permissions : [permissions];
    const hasAny = perms.some(p => hasPermission(user, p));
    
    if (!hasAny) {
        throw new Error("No tienes permisos para esta acción");
    }
}

// ==================== CATEGORÍAS DE EXPEDIENTE ====================

export async function getExpedienteCategories() {
    await verifyPermission(["expedientes.view", "expedientes.manage"]);
    const categories = await expedienteService.getExpedienteCategories();
    return serializePrisma(categories);
}

export async function createExpedienteCategory(data: {
    name: string;
    description?: string;
}) {
    await verifyPermission("expedientes.manage");
    const result = await expedienteService.createExpedienteCategory(data.name, data.description);
    revalidatePath("/dashboard/expedientes");
    return serializePrisma(result);
}

export async function updateExpedienteCategory(id: string, data: {
    name: string;
    description?: string;
}) {
    await verifyPermission("expedientes.manage");
    const result = await expedienteService.updateExpedienteCategory(id, data.name, data.description);
    revalidatePath("/dashboard/expedientes");
    return serializePrisma(result);
}

export async function deleteExpedienteCategory(id: string) {
    await verifyPermission("expedientes.manage");
    const result = await expedienteService.deleteExpedienteCategory(id);
    revalidatePath("/dashboard/expedientes");
    return serializePrisma(result);
}

// ==================== EXPEDIENTES ====================

export async function getExpedientes(filters?: { status?: string }) {
    await verifyPermission(["expedientes.view", "receipts.view", "receipts.manage", "purchases.view", "purchases.manage"]);
    const expedientes = await expedienteService.getExpedientes(filters);
    return serializePrisma(expedientes);
}

export async function getExpediente(id: string) {
    await verifyPermission(["expedientes.view", "receipts.view", "receipts.manage", "purchases.view", "purchases.manage"]);
    const expediente = await expedienteService.getExpediente(id);
    return serializePrisma(expediente);
}

export async function createExpediente(data: {
    number?: string;
    year?: number;
    type?: string;
    origin?: string;
    description?: string;
    status?: string;
    categoryId?: string;
}) {
    await verifyPermission(["expedientes.manage", "purchases.manage", "receipts.manage"]);
    const result = await expedienteService.createExpediente(data);
    revalidatePath("/dashboard/expedientes");
    return serializePrisma(result);
}

export async function updateExpediente(id: string, data: {
    number?: string;
    year?: number;
    type?: string;
    origin?: string;
    description?: string;
    status?: string;
    categoryId?: string;
}) {
    await verifyPermission("expedientes.manage");
    const result = await expedienteService.updateExpediente(id, data);
    revalidatePath("/dashboard/expedientes");
    revalidatePath(`/dashboard/expedientes/${id}`);
    return serializePrisma(result);
}

export async function deleteExpediente(id: string) {
    await verifyPermission("expedientes.manage");
    try {
        const result = await expedienteService.deleteExpediente(id);
        revalidatePath("/dashboard/expedientes");
        return { success: true, error: null };
    } catch (error: any) {
        console.error("Error deleting expediente:", error);
        return { success: false, error: error.message || "Error al eliminar expediente" };
    }
}
