import { getRolesAction, getPermissionsAction } from "@/app/actions/roles";
import { getUsersAction } from "@/app/actions/users";
import { getCurrentUser, hasPermission, isAdminUser } from "@/lib/auth";
import { AdminUsersView } from "@/components/users/admin-users-view";
import { UserProfileView } from "@/components/users/user-profile-view";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        redirect("/auth/login");
    }

    const [{ data: roles }, { data: permissions }, { data: users }] = await Promise.all([
        getRolesAction(),
        getPermissionsAction(),
        getUsersAction(),
    ]);

    // Usa función tipada en lugar de (ur: any)
    const isAdmin = isAdminUser(currentUser);
    const canManage = hasPermission(currentUser, "users.manage");

    if (isAdmin || canManage) {
        // Filtra al usuario actual para que no se vea a sí mismo en la lista
        const filteredUsers = (users || []).filter((u) => u.id !== currentUser.id);

        return (
            <AdminUsersView
                users={filteredUsers}
                roles={roles || []}
                permissions={permissions || []}
                canManage={canManage}
            />
        );
    }

    // Non-admin view
    return <UserProfileView user={currentUser} />;
}
