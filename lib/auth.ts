import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { authService } from "@/services/auth-service";

export async function getSession() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token");

    if (!sessionToken?.value) return null;

    try {
        const payload = await authService.verifySession(sessionToken.value);
        if (!payload) return null;

        // Return structured session typically expected
        return { user: { id: payload.userId as string, email: payload.email as string } };
    } catch (error) {
        return null;
    }
}

export async function getCurrentUser() {
    const session = await getSession();
    if (!session?.user?.id) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            userRoles: {
                include: {
                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    return user;
}

export async function signOut() {
    const cookieStore = await cookies();
    cookieStore.delete("session_token");
    redirect("/auth/login");
}
