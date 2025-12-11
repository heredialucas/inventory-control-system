import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteUserAction } from "@/app/actions/users";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { EditUserDialog } from "@/components/users/edit-user-dialog";

interface UserListProps {
    users: any[];
    roles?: any[];
    canManage?: boolean;
}

export function UserList({ users, roles, canManage = false }: UserListProps) {
    const translateRoleName = (name: string) => {
        const translations: Record<string, string> = {
            ADMIN: "Administrador",
            MANAGER: "Encargado",
            VIEWER: "Empleado"
        };
        return translations[name] || name;
    };
    if (users.length === 0) {
        return (
            <div className="text-center p-8 border rounded-lg text-muted-foreground bg-card">
                No hay usuarios registrados.
            </div>
        );
    }

    return (
        <>
            {/* Desktop Table View */}
            <div className="rounded-md border hidden md:block bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Roles</TableHead>
                            <TableHead>Fecha Creación</TableHead>
                            {canManage && <TableHead className="text-right">Acciones</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <UserRow key={user.id} user={user} roles={roles || []} canManage={canManage} />
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {users.map((user) => (
                    <Card key={user.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {user.firstName || user.lastName
                                    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                                    : "Sin nombre"
                                }
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground mb-4">{user.email}</div>
                            <div className="flex flex-wrap gap-1 mb-4">
                                {user.userRoles?.length > 0 ? (
                                    user.userRoles.map((ur: any) => (
                                        <Badge key={ur.role.id} variant="secondary" className="text-xs">
                                            {translateRoleName(ur.role.name)}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-muted-foreground text-xs">Sin roles</span>
                                )}
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-xs text-muted-foreground">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                                {canManage && (
                                    <div className="flex items-center gap-2">
                                        <EditUserDialog user={user} roles={roles || []} />
                                        <form action={async () => {
                                            "use server";
                                            await deleteUserAction(user.id);
                                        }}>
                                            <Button variant="ghost" size="icon" type="submit">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}

interface UserRowProps {
    user: any;
    roles: any[];
    canManage?: boolean;
}

function UserRow({ user, roles, canManage = false }: UserRowProps) {
    const translateRoleName = (name: string) => {
        const translations: Record<string, string> = {
            ADMIN: "Administrador",
            MANAGER: "Encargado",
            VIEWER: "Empleado"
        };
        return translations[name] || name;
    };
    return (
        <TableRow>
            <TableCell className="font-medium">{user.email}</TableCell>
            <TableCell>
                {user.firstName || user.lastName
                    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                    : "-"
                }
            </TableCell>
            <TableCell>
                <div className="flex flex-wrap gap-1">
                    {user.userRoles?.length > 0 ? (
                        user.userRoles.map((ur: any) => (
                            <Badge key={ur.role.id} variant="secondary" className="text-xs">
                                {translateRoleName(ur.role.name)}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-muted-foreground text-xs">Sin roles</span>
                    )}
                </div>
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
                {new Date(user.createdAt).toLocaleDateString()}
            </TableCell>
            {canManage && (
                <TableCell className="text-right flex items-center justify-end gap-2">
                    <EditUserDialog user={user} roles={roles} />
                    <form action={async () => {
                        "use server";
                        await deleteUserAction(user.id);
                    }}>
                        <Button variant="ghost" size="icon" type="submit">
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </form>
                </TableCell>
            )}
        </TableRow>
    );
}
