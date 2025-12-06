import { getRolesAction, getPermissionsAction } from "@/app/actions/roles";
import { getUsersAction } from "@/app/actions/users";
import { getCurrentUser } from "@/lib/auth";
import { AdminUsersView } from "@/components/users/admin-users-view";
import { UserProfileView } from "@/components/users/user-profile-view";

// Re-enable force-dynamic if config is fixed, otherwise remove if causing issues. 
// Ideally removing cacheComponents from next.config.ts allows us to keep this or default behavior.
export const dynamic = "force-dynamic";

export default async function UsersPage() {
    const currentUser = await getCurrentUser();

    // Safety check - should be handled by layout/middleware usually, but good to have
    if (!currentUser) {
        return <div>No autorizado</div>;
    }

    const [{ data: roles }, { data: permissions }, { data: users }] = await Promise.all([
        getRolesAction(),
        getPermissionsAction(),
        getUsersAction()
    ]);

    const isAdmin = currentUser.userRoles.some((ur: any) => ur.role.name === "ADMIN");

    if (isAdmin) {
        // Filter out current user from the list so they don't see themselves
        const filteredUsers = (users || []).filter((u: any) => u.id !== currentUser.id);

        return (
            <AdminUsersView
                users={filteredUsers}
                roles={roles || []}
                permissions={permissions || []}
            />
        );
    }

    // Non-admin view
    return <UserProfileView user={currentUser} />;
}
