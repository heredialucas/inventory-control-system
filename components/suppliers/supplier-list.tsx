"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Power, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { toggleSupplierStatus, deleteSupplier } from "@/app/actions/suppliers";
import { SupplierForm } from "./supplier-form";

type SupplierWithCounts = {
    id: string;
    name: string;
    code: string;
    email: string | null;
    phone: string | null;
    contactName: string | null;
    address: string | null;
    notes: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: {
        purchaseOrders: number;
    };
};

interface SupplierListProps {
    suppliers: SupplierWithCounts[];
}

export function SupplierList({ suppliers }: SupplierListProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [editingSupplier, setEditingSupplier] = useState<SupplierWithCounts | null>(null);

    const handleToggleStatus = (id: string) => {
        startTransition(async () => {
            try {
                await toggleSupplierStatus(id);
                toast.success("Estado del proveedor actualizado");
                router.refresh();
            } catch (error: any) {
                toast.error(error.message || "Error al actualizar el estado");
            }
        });
    };

    const handleDelete = (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar el proveedor "${name}"?`)) {
            return;
        }

        startTransition(async () => {
            try {
                await deleteSupplier(id);
                toast.success("Proveedor eliminado exitosamente");
                router.refresh();
            } catch (error: any) {
                toast.error(error.message || "Error al eliminar el proveedor");
            }
        });
    };

    if (suppliers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron proveedores</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Comienza creando tu primer proveedor
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Vista móvil - Cards */}
            <div className="md:hidden space-y-4">
                {suppliers.map((supplier) => (
                    <Card key={supplier.id}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold truncate">{supplier.name}</h3>
                                        <Badge variant={supplier.isActive ? "default" : "secondary"}>
                                            {supplier.isActive ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                        <p className="font-mono">{supplier.code}</p>
                                        {supplier.contactName && <p>Contacto: {supplier.contactName}</p>}
                                        {supplier.email && <p>{supplier.email}</p>}
                                        {supplier.phone && <p>{supplier.phone}</p>}
                                        <p>Pedidos: {supplier._count.purchaseOrders}</p>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" disabled={isPending}>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href={`/dashboard/suppliers/${supplier.id}`}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Ver Detalles
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setEditingSupplier(supplier)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleToggleStatus(supplier.id)}>
                                            <Power className="mr-2 h-4 w-4" />
                                            {supplier.isActive ? "Desactivar" : "Activar"}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() => handleDelete(supplier.id, supplier.name)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Eliminar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Vista desktop - Tabla */}
            <div className="hidden md:block">
                <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Contacto</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Pedidos</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {suppliers.map((supplier) => (
                            <TableRow key={supplier.id}>
                                <TableCell className="font-mono font-semibold">{supplier.code}</TableCell>
                                <TableCell className="font-medium">{supplier.name}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {supplier.contactName || "-"}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {supplier.email || "-"}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{supplier._count.purchaseOrders}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={supplier.isActive ? "default" : "secondary"}>
                                        {supplier.isActive ? "Activo" : "Inactivo"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" disabled={isPending}>
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Acciones</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/suppliers/${supplier.id}`}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Ver Detalles
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setEditingSupplier(supplier)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggleStatus(supplier.id)}>
                                                <Power className="mr-2 h-4 w-4" />
                                                {supplier.isActive ? "Desactivar" : "Activar"}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onClick={() => handleDelete(supplier.id, supplier.name)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </div>
            </div>

            {editingSupplier && (
                <SupplierForm
                    supplier={editingSupplier}
                    trigger={<div />}
                />
            )}
        </>
    );
}
