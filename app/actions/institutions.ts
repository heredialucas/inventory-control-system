"use server";

import { institutionService } from "@/services/institution-service";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getInstitutions() {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "institutions.view")) {
        throw new Error("No tienes permisos para ver instituciones");
    }

    try {
        return await institutionService.getInstitutions();
    } catch (error) {
        console.error("Error getting institutions:", error);
        throw new Error("Failed to fetch institutions");
    }
}

export async function getInstitution(id: string) {
    try {
        return await institutionService.getInstitution(id);
    } catch (error) {
        console.error("Error getting institution:", error);
        throw new Error("Failed to fetch institution");
    }
}

export async function createInstitution(data: {
    name: string;
    code: string;
    type?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
}) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "institutions.manage")) {
        throw new Error("No tienes permisos para crear instituciones");
    }

    try {
        const institution = await institutionService.createInstitution(data);
        revalidatePath("/dashboard/institutions");
        return institution;
    } catch (error: any) {
        console.error("Error creating institution:", error);
        if (error.code === "P2002") {
            throw new Error("Institution code already exists");
        }
        throw new Error("Failed to create institution");
    }
}

export async function updateInstitution(
    id: string,
    data: {
        name?: string;
        code?: string;
        type?: string;
        contactName?: string;
        email?: string;
        phone?: string;
        address?: string;
        notes?: string;
    }
) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "institutions.manage")) {
        throw new Error("No tienes permisos para editar instituciones");
    }

    try {
        const institution = await institutionService.updateInstitution(id, data);
        revalidatePath("/dashboard/institutions");
        revalidatePath(`/dashboard/institutions/${id}`);
        return institution;
    } catch (error: any) {
        console.error("Error updating institution:", error);
        if (error.code === "P2002") {
            throw new Error("Institution code already exists");
        }
        throw new Error("Failed to update institution");
    }
}

export async function toggleInstitutionStatus(id: string) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "institutions.manage")) {
        throw new Error("No tienes permisos para cambiar estado de instituciones");
    }

    try {
        const institution = await institutionService.toggleInstitutionStatus(id);
        revalidatePath("/dashboard/institutions");
        revalidatePath(`/dashboard/institutions/${id}`);
        return institution;
    } catch (error) {
        console.error("Error toggling institution status:", error);
        throw new Error("Failed to update institution status");
    }
}

export async function deleteInstitution(id: string) {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "institutions.manage")) {
        throw new Error("No tienes permisos para eliminar instituciones");
    }

    try {
        await institutionService.deleteInstitution(id);
        revalidatePath("/dashboard/institutions");
    } catch (error: any) {
        console.error("Error deleting institution:", error);
        throw new Error(error.message || "Failed to delete institution");
    }
}
