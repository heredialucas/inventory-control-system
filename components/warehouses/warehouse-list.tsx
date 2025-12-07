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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Power, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { toggleWarehouseStatus, deleteWarehouse } from "@/app/actions/warehouses";
import { WarehouseForm } from "./warehouse-form";

type WarehouseWithCounts = {
    id: string;
    name: string;
    code: string;
    description: string | null;
    address: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: {
        stockItems: number;
        transfersFrom: number;
        transfersTo: number;
    };
};

interface WarehouseListProps {
    warehouses: WarehouseWithCounts[];
    canManage?: boolean;
}

export function WarehouseList({ warehouses, canManage = false }: WarehouseListProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [editingWarehouse, setEditingWarehouse] = useState<WarehouseWithCounts | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    // Open dialog when warehouse is set for editing
    useEffect(() => {
        if (editingWarehouse) {
            setEditDialogOpen(true);
        }
    }, [editingWarehouse]);

    const handleToggleStatus = (id: string) => {
        startTransition(async () => {
            try {
                await toggleWarehouseStatus(id);
                toast.success("Estado del depósito actualizado");
                router.refresh();
            } catch (error: any) {
                toast.error(error.message || "Error al actualizar estado");
            }
        });
    };

    const handleDelete = (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar el depósito "${name}"?`)) {
            return;
        }

        startTransition(async () => {
            try {
                await deleteWarehouse(id);
                toast.success("Depósito eliminado exitosamente");
                router.refresh();
            } catch (error: any) {
                toast.error(error.message || "Error al eliminar depósito");
            }
        });
    };

    if (warehouses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron depósitos</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Comienza creando tu primer depósito
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Vista de tabla para desktop */}
            <div className="hidden md:block rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Dirección</TableHead>
                            <TableHead>Productos</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {warehouses.map((warehouse) => (
                            <TableRow key={warehouse.id}>
                                <TableCell className="font-mono font-semibold">{warehouse.code}</TableCell>
                                <TableCell>
                                    <div>
                                        <div className="font-medium">{warehouse.name}</div>
                                        {warehouse.description && (
                                            <div className="text-sm text-muted-foreground line-clamp-1">
                                                {warehouse.description}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {warehouse.address || "-"}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{warehouse._count.stockItems}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={warehouse.isActive ? "default" : "secondary"}>
                                        {warehouse.isActive ? "Activo" : "Inactivo"}
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
                                                <Link href={`/dashboard/warehouses/${warehouse.id}`}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Ver Detalles
                                                </Link>
                                            </DropdownMenuItem>
                                            {canManage && (
                                                <>
                                                    <DropdownMenuItem onClick={() => setEditingWarehouse(warehouse)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleToggleStatus(warehouse.id)}>
                                                        <Power className="mr-2 h-4 w-4" />
                                                        {warehouse.isActive ? "Desactivar" : "Activar"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => handleDelete(warehouse.id, warehouse.name)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Vista de cards para móviles */}
            <div className="md:hidden space-y-4">
                {warehouses.map((warehouse) => (
                    <Card key={warehouse.id}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h4 className="font-medium">{warehouse.name}</h4>
                                    <p className="text-sm text-muted-foreground font-mono">
                                        Código: {warehouse.code}
                                    </p>
                                    {warehouse.description && (
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                            {warehouse.description}
                                        </p>
                                    )}
                                </div>
                                <Badge variant={warehouse.isActive ? "default" : "secondary"}>
                                    {warehouse.isActive ? "Activo" : "Inactivo"}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div>
                                    <p className="text-muted-foreground">Dirección</p>
                                    <p className="mt-1">{warehouse.address || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Productos</p>
                                    <Badge variant="secondary" className="mt-1">{warehouse._count.stockItems}</Badge>
                                </div>
                            </div>

                            <div className="flex justify-end pt-3 border-t">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" disabled={isPending}>
                                            <MoreHorizontal className="h-4 w-4 mr-1" />
                                            Acciones
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href={`/dashboard/warehouses/${warehouse.id}`}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Ver Detalles
                                            </Link>
                                        </DropdownMenuItem>
                                        {canManage && (
                                            <>
                                                <DropdownMenuItem onClick={() => setEditingWarehouse(warehouse)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleToggleStatus(warehouse.id)}>
                                                    <Power className="mr-2 h-4 w-4" />
                                                    {warehouse.isActive ? "Desactivar" : "Activar"}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => handleDelete(warehouse.id, warehouse.name)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Edit Dialog */}
            {editingWarehouse && (
                <WarehouseForm
                    warehouse={editingWarehouse}
                    isOpen={editDialogOpen}
                    onOpenChange={(open) => {
                        setEditDialogOpen(open);
                        if (!open) {
                            setEditingWarehouse(null);
                        }
                    }}
                />
            )}
        </>
    );
}
