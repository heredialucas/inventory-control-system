import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PermissionList({ permissions }: { permissions: any[] }) {
    if (permissions.length === 0) {
        return (
            <div className="text-center p-8 border rounded-lg text-muted-foreground bg-card">
                No hay permisos definidos.
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
                            <TableHead>Acción</TableHead>
                            <TableHead>Descripción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {permissions.map((permission) => (
                            <TableRow key={permission.id}>
                                <TableCell className="font-mono text-xs">{permission.action}</TableCell>
                                <TableCell>{permission.description || "-"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {permissions.map((permission) => (
                    <Card key={permission.id}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium font-mono">{permission.action}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground">{permission.description || "Sin descripción"}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}
