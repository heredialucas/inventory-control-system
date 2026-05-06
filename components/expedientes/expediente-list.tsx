"use client";

import { useState } from "react";
import Link from "next/link";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, Eye, Pencil } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    deleteExpedienteCategory,
} from "@/app/actions/expedientes";
import { toast } from "sonner";

interface Category {
    id: string;
    name: string;
    description: string | null;
    _count: { expedientes: number };
}

interface ExpedienteListProps {
    expedientes: any[];
    canManage: boolean;
    categories?: Category[];
}

export function ExpedienteList({ expedientes, canManage, categories = [] }: ExpedienteListProps) {
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    const filtered = expedientes.filter((e) => {
        const matchSearch =
            e.number.toLowerCase().includes(search.toLowerCase()) ||
            e.description?.toLowerCase().includes(search.toLowerCase());
        const matchCategory =
            categoryFilter === "all" || e.categoryId === categoryFilter;
        return matchSearch && matchCategory;
    });

    const handleDeleteCategory = async (id: string) => {
        try {
            await deleteExpedienteCategory(id);
            toast.success("Categoría eliminada correctamente");
            window.location.reload();
        } catch (error: any) {
            toast.error(error.message || "Error al eliminar categoría");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar expedientes..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                    <Badge key={cat.id} variant="secondary" className="flex items-center gap-1">
                        {cat.name}
                        {canManage && cat._count.expedientes === 0 && (
                            <button
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="ml-1 hover:text-red-500"
                            >
                                ×
                            </button>
                        )}
                    </Badge>
                ))}
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Número / Año</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Origen</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Creado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No se encontraron expedientes
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((expediente) => (
                                <TableRow key={expediente.id}>
                                    <TableCell>
                                        <div className="font-medium">
                                            {expediente.number}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {expediente.year}
                                        </div>
                                    </TableCell>
                                    <TableCell>{expediente.type || "-"}</TableCell>
                                    <TableCell>
                                        {expediente.category?.name || "-"}
                                    </TableCell>
                                    <TableCell>{expediente.origin || "-"}</TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {expediente.description}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                expediente.status === "ABIERTO"
                                                    ? "default"
                                                    : expediente.status === "CERRADO"
                                                    ? "secondary"
                                                    : "destructive"
                                            }
                                        >
                                            {expediente.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {expediente.createdAt
                                            ? format(
                                                  new Date(expediente.createdAt),
                                                  "dd/MM/yyyy",
                                                  { locale: es }
                                              )
                                            : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                            >
                                                <Link
                                                    href={`/dashboard/expedientes/${expediente.id}`}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            {canManage && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/dashboard/expedientes/${expediente.id}/edit`}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}