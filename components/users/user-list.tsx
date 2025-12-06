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

import { EditUserDialog } from "@/components/users/edit-user-dialog";

export function UserList({ users, roles }: { users: any[], roles?: any[] }) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead>Fecha Creación</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">
                                No hay usuarios registrados.
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map((user) => (
                            <UserRow key={user.id} user={user} roles={roles || []} />
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

function UserRow({ user, roles }: { user: any, roles: any[] }) {
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
                                {ur.role.name}
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
        </TableRow>
    );
}
