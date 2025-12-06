import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export function PermissionList({ permissions }: { permissions: any[] }) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Acción</TableHead>
                        <TableHead>Descripción</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {permissions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={2} className="text-center h-24">
                                No hay permisos definidos.
                            </TableCell>
                        </TableRow>
                    ) : (
                        permissions.map((permission) => (
                            <TableRow key={permission.id}>
                                <TableCell className="font-mono text-xs">{permission.action}</TableCell>
                                <TableCell>{permission.description || "-"}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
