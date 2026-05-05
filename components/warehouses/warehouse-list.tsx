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
import { Input } from "@/components/ui/input";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Eye, Edit, Trash2, Package, Search } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { deleteWarehouse } from "@/app/actions/warehouses";
import { WarehouseForm } from "./warehouse-form";

type WarehouseWithCounts = {
    id: string;
    name: string;
    code: string;
    description: string | null;
    address: string | null;
    type: "DEPOSIT" | "OFFICE";
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
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
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");

    // Open dialog when warehouse is set for editing
    useEffect(() => {
        if (editingWarehouse) {
            setEditDialogOpen(true);
        }
    }, [editingWarehouse]);

    const filteredWarehouses = warehouses.filter((w) => {
        const matchSearch =
            w.name.toLowerCase().includes(search.toLowerCase()) ||
            w.code.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "all" || w.type === typeFilter;
        return matchSearch && matchType;
    });

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

    if (filteredWarehouses.length === 0) {
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

    const hasWarehouseWithStock = warehouses.some(w => w._count.stockItems > 0);

    return (
        <>
            {/* Filtros */}
            <div className="flex flex-wrap gap-4 items-center mb-4">
                <div className="relative max-w-xs flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los tipos</SelectItem>
                        <SelectItem value="DEPOSIT">Depósitos</SelectItem>
                        <SelectItem value="OFFICE">Oficinas</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {hasWarehouseWithStock && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-md p-3 text-sm mb-4">
                    <strong>Nota:</strong> Los depósitos con productos no pueden ser eliminados. 
                    Primero debe transferir el stock a otro depósito.
                </div>
            )}

            {/* Vista de tabla para desktop */}
            <div className="hidden md:block rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Dirección</TableHead>
                            <TableHead>Productos</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredWarehouses.map((warehouse) => (
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
                                <TableCell>
                                    <Badge variant={warehouse.type === "OFFICE" ? "default" : "outline"}>
                                        {warehouse.type === "OFFICE" ? "Oficina" : "Depósito"}
                                    </Badge>
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
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/dashboard/warehouses/${warehouse.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        {canManage && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditingWarehouse(warehouse)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={warehouse._count.stockItems > 0 ? "text-muted-foreground" : "text-destructive"}
                                                    disabled={isPending || warehouse._count.stockItems > 0}
                                                    onClick={() => handleDelete(warehouse.id, warehouse.name)}
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

            {/* Vista de cards para móviles */}
            <div className="md:hidden space-y-4">
                {filteredWarehouses.map((warehouse) => (
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
                                <Badge variant={warehouse.type === "OFFICE" ? "default" : "outline"}>
                                    {warehouse.type === "OFFICE" ? "Oficina" : "Depósito"}
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

                            <div className="flex flex-wrap gap-2 pt-3 border-t">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/dashboard/warehouses/${warehouse.id}`}>
                                        <Eye className="h-4 w-4 mr-1" />
                                        Ver
                                    </Link>
                                </Button>
                                {canManage && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setEditingWarehouse(warehouse)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Editar
                                        </Button>
                                        <Button
                                            variant={warehouse._count.stockItems > 0 ? "outline" : "destructive"}
                                            size="sm"
                                            disabled={isPending || warehouse._count.stockItems > 0}
                                            onClick={() => handleDelete(warehouse.id, warehouse.name)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            {warehouse._count.stockItems > 0 ? "Con Stock" : "Eliminar"}
                                        </Button>
                                    </>
                                )}
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
