
import { RoleList } from "@/components/roles/role-list";
import { PermissionList } from "@/components/roles/permission-list";
import { UserList } from "@/components/users/user-list";
import { CreateUserDialog } from "@/components/users/create-user-dialog";
import { CreateRoleDialog } from "@/components/roles/create-role-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface AdminUsersViewProps {
    users: any[];
    roles: any[];
    permissions: any[];
    canManage?: boolean;
}

export function AdminUsersView({ users, roles, permissions, canManage = false }: AdminUsersViewProps) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Gestión de Usuarios y Accesos</h3>
                <p className="text-sm text-muted-foreground">
                    {canManage
                        ? "Panel de administración de usuarios (Vista de Administrador)."
                        : "Panel de usuarios (Solo lectura)."}
                </p>
            </div>
            <Separator />

            <Tabs defaultValue="users" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="users">Usuarios</TabsTrigger>
                    <TabsTrigger value="roles">Roles</TabsTrigger>
                    <TabsTrigger value="permissions">Permisos</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold">Usuarios Registrados</h4>
                            <p className="text-xs text-muted-foreground">
                                {canManage
                                    ? "Administra el acceso y roles de los otros usuarios."
                                    : "Lista de usuarios del sistema."}
                            </p>
                        </div>
                        {canManage && <CreateUserDialog roles={roles || []} />}
                    </div>
                    <UserList users={users || []} roles={roles || []} canManage={canManage} />
                </TabsContent>

                <TabsContent value="roles" className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold">Roles del Sistema</h4>
                            <p className="text-xs text-muted-foreground">
                                {canManage
                                    ? "Define roles y asigna sus permisos."
                                    : "Lista de roles del sistema."}
                            </p>
                        </div>
                        {canManage && <CreateRoleDialog permissions={permissions || []} />}
                    </div>
                    <RoleList roles={roles || []} permissions={permissions || []} canManage={canManage} />
                </TabsContent>

                <TabsContent value="permissions" className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold">Permisos del Sistema</h4>
                            <p className="text-xs text-muted-foreground">Listado de permisos disponibles (Solo lectura).</p>
                        </div>
                    </div>
                    <PermissionList permissions={permissions || []} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
