
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
}

export function AdminUsersView({ users, roles, permissions }: AdminUsersViewProps) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Gestión de Usuarios y Accesos</h3>
                <p className="text-sm text-muted-foreground">
                    Panel de administración de usuarios (Vista de Administrador).
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
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold">Usuarios Registrados</h4>
                            <p className="text-xs text-muted-foreground">Administra el acceso y roles de los otros usuarios.</p>
                        </div>
                        <CreateUserDialog roles={roles || []} />
                    </div>
                    <UserList users={users || []} roles={roles || []} />
                </TabsContent>

                <TabsContent value="roles" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold">Roles del Sistema</h4>
                            <p className="text-xs text-muted-foreground">Define roles y asigna sus permisos.</p>
                        </div>
                        <CreateRoleDialog permissions={permissions || []} />
                    </div>
                    <RoleList roles={roles || []} permissions={permissions || []} />
                </TabsContent>

                <TabsContent value="permissions" className="space-y-4">
                    <div className="flex items-center justify-between">
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
