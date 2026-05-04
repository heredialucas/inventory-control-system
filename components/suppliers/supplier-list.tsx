"use client";

import { useState, useTransition, useEffect } from "react";
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
import { MoreHorizontal, Eye, Edit, Trash2, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { deleteSupplier } from "@/app/actions/suppliers";
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
    deletedAt: Date | null;
    _count: {
        purchaseOrders: number;
        receipts: number;
    };
};

interface SupplierListProps {
    suppliers: SupplierWithCounts[];
    canManage?: boolean;
}

export function SupplierList({ suppliers, canManage = false }: SupplierListProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [editingSupplier, setEditingSupplier] = useState<SupplierWithCounts | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    useEffect(() => {
        if (editingSupplier) {
            setEditDialogOpen(true);
        }
    }, [editingSupplier]);

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
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h4 className="font-medium">{supplier.name}</h4>
                                    <p className="text-sm text-muted-foreground font-mono">
                                        Código: {supplier.code}
                                    </p>
                                    {supplier.contactName && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Contacto: {supplier.contactName}
                                        </p>
                                    )}
                                </div>
                                <Badge variant={supplier.isActive ? "default" : "secondary"}>
                                    {supplier.isActive ? "Activo" : "Inactivo"}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div>
                                    <p className="text-muted-foreground">Email</p>
                                    <p className="mt-1">{supplier.email || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Teléfono</p>
                                    <p className="mt-1">{supplier.phone || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Pedidos</p>
                                    <Badge variant="secondary" className="mt-1">{supplier._count.purchaseOrders}</Badge>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Ingresos</p>
                                    <Badge variant="secondary" className="mt-1">{supplier._count.receipts}</Badge>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-3 border-t">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/dashboard/suppliers/${supplier.id}`}>
                                        <Eye className="h-4 w-4 mr-1" />
                                        Ver
                                    </Link>
                                </Button>
                                {canManage && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setEditingSupplier(supplier)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Editar
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            disabled={isPending || supplier._count.purchaseOrders > 0 || supplier._count.receipts > 0}
                                            onClick={() => handleDelete(supplier.id, supplier.name)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            {(supplier._count.purchaseOrders > 0 || supplier._count.receipts > 0) ? "Con Actividad" : "Eliminar"}
                                        </Button>
                                    </>
                                )}
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
                                <TableHead>Ingresos</TableHead>
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
                                        <Badge variant="secondary">{supplier._count.receipts}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={supplier.isActive ? "default" : "secondary"}>
                                            {supplier.isActive ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/dashboard/suppliers/${supplier.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            {canManage && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setEditingSupplier(supplier)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={supplier._count.purchaseOrders > 0 || supplier._count.receipts > 0 ? "text-muted-foreground" : "text-destructive"}
                                                        disabled={isPending || supplier._count.purchaseOrders > 0 || supplier._count.receipts > 0}
                                                        onClick={() => handleDelete(supplier.id, supplier.name)}
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
            </div>

            {editingSupplier && (
                <SupplierForm
                    supplier={editingSupplier}
                    isOpen={editDialogOpen}
                    onOpenChange={(open) => {
                        setEditDialogOpen(open);
                        if (!open) {
                            setEditingSupplier(null);
                        }
                    }}
                />
            )}
        </>
    );
}
