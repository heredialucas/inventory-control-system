"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Eye, Edit, Trash2, Building2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { deleteInstitution } from "@/app/actions/institutions";

type InstitutionWithCounts = {
    id: string;
    name: string;
    code: string;
    type: string | null;
    contactName: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    isActive: boolean;
    _count: {
        deliveries: number;
    };
};

interface InstitutionListProps {
    institutions: InstitutionWithCounts[];
    canManage?: boolean;
}

export function InstitutionList({ institutions, canManage = false }: InstitutionListProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar la escuela "${name}"?`)) {
            return;
        }

        startTransition(async () => {
            try {
                await deleteInstitution(id);
                toast.success("Escuela eliminada exitosamente");
                router.refresh();
            } catch (error: any) {
                toast.error(error.message || "Error al eliminar escuela");
            }
        });
    };

    if (institutions.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No se encontraron escuelas</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Comience registrando una nueva escuela en el sistema
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            {/* Desktop Table */}
            <div className="hidden md:block rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Contacto</TableHead>
                            <TableHead>Entregas</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
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
                                        {institution.isActive ? "Activo" : "Inactivo"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/dashboard/institutions/${institution.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        {canManage && (
                                            <>
                                                <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/dashboard/institutions/${institution.id}/edit`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive"
                                                    disabled={isPending}
                                                    onClick={() => handleDelete(institution.id, institution.name)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {institutions.map((institution) => (
                    <Card key={institution.id}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h4 className="font-medium">{institution.name}</h4>
                                    <p className="text-sm text-muted-foreground font-mono">
                                        Código: {institution.code}
                                    </p>
                                    {institution.type && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {institution.type}
                                        </p>
                                    )}
                                </div>
                                <Badge variant={institution.isActive ? "default" : "secondary"}>
                                    {institution.isActive ? "Activo" : "Inactivo"}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div>
                                    <p className="text-muted-foreground">Contacto</p>
                                    <p className="mt-1">{institution.contactName || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Entregas</p>
                                    <Badge variant="secondary" className="mt-1">{institution._count.deliveries}</Badge>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-3 border-t">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/dashboard/institutions/${institution.id}`}>
                                        <Eye className="h-4 w-4 mr-1" />
                                        Ver
                                    </Link>
                                </Button>
                                {canManage && (
                                    <>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/dashboard/institutions/${institution.id}/edit`}>
                                                <Edit className="h-4 w-4 mr-1" />
                                                Editar
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            disabled={isPending}
                                            onClick={() => handleDelete(institution.id, institution.name)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Eliminar
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            </>
    );
}