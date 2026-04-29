"use server";

import { expedienteService } from "@/services/expediente-service";
import { getCurrentUser, hasPermission } from "@/lib/auth";

async function verifyPermission(permission: string) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, permission)) {
        throw new Error("No tienes permisos para esta acción");
    }
}

export async function getExpedientes(filters?: { status?: string }) {
    await verifyPermission("expedientes.view");
    return expedienteService.getExpedientes(filters);
}

export async function getExpediente(id: string) {
    await verifyPermission("expedientes.view");
    return expedienteService.getExpediente(id);
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
    return expedienteService.createExpediente(data);
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
    return expedienteService.updateExpediente(id, data);
}
