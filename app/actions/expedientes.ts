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
}) {
    await verifyPermission("expedientes.manage");
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
}) {
    await verifyPermission("expedientes.manage");
    const result = await expedienteService.updateExpediente(id, data);
    revalidatePath("/dashboard/expedientes");
    revalidatePath(`/dashboard/expedientes/${id}`);
    return serializePrisma(result);
}
