"use server";

import { authService } from "@/services/auth-service";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
    const identifier = formData.get("identifier") as string;
    const password = formData.get("password") as string;

    if (!identifier || !password) {
        return { error: "Faltan datos" };
    }

    try {
        const { token } = await authService.login(identifier, password);

        // Set HTTP-only cookie
        const cookieStore = await cookies();
        cookieStore.set("session_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return { success: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al iniciar sesión" };
    }
}

export async function registerAction(data: { email: string, password: string, username?: string }) {
    const { email, password, username } = data;

    if (!email || !password) {
        return { error: "Faltan datos" };
    }

    try {
        await authService.register(email, password, username);
        // Auto-login after register
        const { token } = await authService.login(email, password);

        const cookieStore = await cookies();
        cookieStore.set("session_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return { success: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al registrarse" };
    }
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete("session_token");
    redirect("/auth/login");
}

export async function forgotPasswordAction(email: string) {
    if (!email) return { error: "Email requerido" };
    try {
        await authService.requestPasswordReset(email);
        return { success: true };
    } catch (error) {
        return { error: "Error al solicitar restablecimiento" };
    }
}

export async function updatePasswordAction(password: string) {
    if (!password) return { error: "Contraseña requerida" };

    // Need current user context
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token");
    if (!token) return { error: "No autorizado" };

    const session = await authService.verifySession(token.value);
    if (!session?.userId) return { error: "No autorizado" };

    try {
        await authService.updatePassword(password, session.userId as string);
        return { success: true };
    } catch (error) {
        return { error: "Error al actualizar contraseña" };
    }
}
