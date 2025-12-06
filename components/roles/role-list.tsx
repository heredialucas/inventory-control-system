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

export function RoleList({ roles, permissions }: { roles: any[], permissions: any[] }) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Permisos</TableHead>
                        <TableHead className="text-right">Usuarios</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {roles.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">
                                No hay roles definidos.
                            </TableCell>
                        </TableRow>
                    ) : (
                        roles.map((role) => (
                            <RoleRow key={role.id} role={role} permissions={permissions || []} />
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

// Separate client component for interactive rows if needed, or keeping it simple here
function RoleRow({ role, permissions }: { role: any, permissions: any[] }) {
    // We need a client component form for delete action to be simple
    return (
        <TableRow>
            <TableCell className="font-medium">{role.name}</TableCell>
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
        </TableRow>
    );
}
