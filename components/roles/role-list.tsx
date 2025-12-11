import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Users } from "lucide-react";
import { deleteRoleAction } from "@/app/actions/roles";
import { Badge } from "@/components/ui/badge";
import { EditRoleDialog } from "./edit-role-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RoleListProps {
    roles: any[];
    permissions: any[];
    canManage?: boolean;
}

export function RoleList({ roles, permissions, canManage = false }: RoleListProps) {
    const translateRoleName = (name: string) => {
        const translations: Record<string, string> = {
            ADMIN: "Administrador",
            MANAGER: "Encargado",
            VIEWER: "Empleado"
        };
        return translations[name] || name;
    };
    if (roles.length === 0) {
        return (
            <div className="text-center p-8 border rounded-lg text-muted-foreground bg-card">
                No hay roles definidos.
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
                            <TableHead>Nombre</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Permisos</TableHead>
                            <TableHead className="text-right">Usuarios</TableHead>
                            {canManage && <TableHead className="text-right">Acciones</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles.map((role) => (
                            <TableRow key={role.id}>
                                <TableCell className="font-medium">{translateRoleName(role.name)}</TableCell>
                                <TableCell className="text-muted-foreground">{role.description}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {role.permissions.length > 0 ? (
                                            <Badge variant="outline" className="text-xs">
                                                {role.permissions.length} permisos
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">Sin permisos</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                                        <Users className="h-3 w-3" />
                                        <span className="text-xs">{role._count.users}</span>
                                    </div>
                                </TableCell>
                                {canManage && (
                                    <TableCell className="text-right flex items-center justify-end gap-2">
                                        <EditRoleDialog role={role} permissions={permissions} />
                                        <form action={async () => {
                                            "use server";
                                            await deleteRoleAction(role.id);
                                        }}>
                                            <Button variant="ghost" size="icon" type="submit" disabled={role.name === "ADMIN"}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </form>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {roles.map((role) => (
                    <Card key={role.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{translateRoleName(role.name)}</CardTitle>
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <Users className="h-3 w-3" />
                                <span className="text-xs">{role._count.users}</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground mb-4">{role.description}</div>
                            <div className="flex flex-wrap gap-1 mb-4">
                                {role.permissions.length > 0 ? (
                                    <Badge variant="outline" className="text-xs">
                                        {role.permissions.length} permisos
                                    </Badge>
                                ) : (
                                    <span className="text-muted-foreground text-xs">Sin permisos</span>
                                )}
                            </div>
                            {canManage && (
                                <div className="flex items-center justify-end gap-2">
                                    <EditRoleDialog role={role} permissions={permissions} />
                                    <form action={async () => {
                                        "use server";
                                        await deleteRoleAction(role.id);
                                    }}>
                                        <Button variant="ghost" size="icon" type="submit" disabled={role.name === "ADMIN"}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </form>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}
