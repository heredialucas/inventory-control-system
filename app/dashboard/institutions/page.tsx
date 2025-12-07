import { getCurrentUser, hasPermission } from "@/lib/auth";
import { getInstitutions } from "@/app/actions/institutions";
import { UnauthorizedAccess } from "@/components/unauthorized-access";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Building2 } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Institutions | Inventory Control",
    description: "Manage institutions and deliveries",
};

export default async function InstitutionsPage() {
    const user = await getCurrentUser();

    if (!user || !hasPermission(user, "institutions.view")) {
        return <UnauthorizedAccess action="ver" resource="instituciones" />;
    }

    const institutions = await getInstitutions();
    const canManage = hasPermission(user, "institutions.manage");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Escuelas</h1>
                    <p className="text-muted-foreground">
                        Gestión de establecimientos educativos
                    </p>
                </div>
                {canManage && (
                    <Button asChild>
                        <Link href="/dashboard/institutions/new">
                            <Building2 className="mr-2 h-4 w-4" />
                            Nueva Escuela
                        </Link>
                    </Button>
                )}
            </div>

            {institutions.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No se encontraron escuelas</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Comience registrando una nueva escuela en el sistema
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Deliveries</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {institutions.map((institution) => (
                                <TableRow key={institution.id}>
                                    <TableCell className="font-mono font-medium">
                                        <Link
                                            href={`/dashboard/institutions/${institution.id}`}
                                            className="hover:underline"
                                        >
                                            {institution.code}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{institution.name}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {institution.type || "-"}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {institution.contactName || "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {institution._count.deliveries}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={institution.isActive ? "default" : "secondary"}>
                                            {institution.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
