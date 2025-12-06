"use server";

import { userService } from "@/services/user-service";
import { revalidatePath } from "next/cache";

export async function getUsersAction() {
    try {
        const users = await userService.getUsers();
        return { success: true, data: users };
    } catch (error) {
        return { success: false, error: "Error al obtener usuarios" };
    }
}

export async function createUserAction(data: { email: string; password?: string; firstName?: string; lastName?: string; roleIds?: string[] }) {
    if (!data.email) return { error: "El email es obligatorio" };

    try {
        await userService.createUser(data);
        revalidatePath("/dashboard/users");
        return { success: true };
    } catch (error) {
        return { error: "Error al crear usuario. El email podría estar duplicado." };
    }
}

export async function updateUserAction(id: string, data: { firstName?: string; lastName?: string; roleIds?: string[] }) {
    try {
        await userService.updateUser(id, data);
        revalidatePath("/dashboard/users");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Error al actualizar usuario" };
    }
}

export async function deleteUserAction(id: string) {
    try {
        await userService.deleteUser(id);
        revalidatePath("/dashboard/users");
        return { success: true };
    } catch (error) {
        return { error: "Error al eliminar usuario" };
    }
}
