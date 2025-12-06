"use server";

import { roleService } from "@/services/role-service";
import { revalidatePath } from "next/cache";

export async function getRolesAction() {
    try {
        const roles = await roleService.getRoles();
        return { success: true, data: roles };
    } catch (error) {
        return { success: false, error: "Error al obtener roles" };
    }
}

export async function getPermissionsAction() {
    try {
        const permissions = await roleService.getPermissions();
        return { success: true, data: permissions };
    } catch (error) {
        return { success: false, error: "Error al obtener permisos" };
    }
}

export async function createRoleAction(data: { name: string; description?: string; permissionIds?: string[] }) {
    if (!data.name) return { error: "El nombre es obligatorio" };
    try {
        await roleService.createRole(data.name, data.description, data.permissionIds || []);
        revalidatePath("/dashboard/account");
        return { success: true };
    } catch (error) {
        return { error: "Error al crear el rol. Asegúrate que el nombre sea único." };
    }
}

export async function updateRoleAction(id: string, data: { name: string; description?: string; permissionIds?: string[] }) {
    if (!data.name) return { error: "El nombre es obligatorio" };
    try {
        await roleService.updateRole(id, data.name, data.description, data.permissionIds || []);
        revalidatePath("/dashboard/users"); // Ensure revalidation path is correct
        return { success: true };
    } catch (error) {
        return { error: "Error al actualizar el rol." };
    }
}

export async function deleteRoleAction(id: string) {
    try {
        await roleService.deleteRole(id);
        revalidatePath("/dashboard/account");
        return { success: true };
    } catch (error) {
        return { error: "Error al eliminar el rol" };
    }
}

export async function createPermissionAction(data: { action: string; description?: string }) {
    if (!data.action) return { error: "La acción es obligatoria" };
    try {
        await roleService.createPermission(data.action, data.description);
        revalidatePath("/dashboard/account");
        return { success: true };
    } catch (error) {
        return { error: "Error al crear permiso" };
    }
}
