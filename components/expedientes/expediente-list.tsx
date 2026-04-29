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
import { Search, Eye, Pencil } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ExpedienteListProps {
    expedientes: any[];
    canManage: boolean;
}

export function ExpedienteList({ expedientes, canManage }: ExpedienteListProps) {
    const [search, setSearch] = useState("");

    const filtered = expedientes.filter(
        (e) =>
            e.number.toLowerCase().includes(search.toLowerCase()) ||
            e.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar expedientes..."
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Número / Año</TableHead>
                            <TableHead>Tipo</TableHead>
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
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No se encontraron expedientes
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((expediente) => (
                                <TableRow key={expediente.id}>
                                    <TableCell className="font-medium">
                                        <div>{expediente.number}</div>
                                        {expediente.year && (
                                            <div className="text-xs text-muted-foreground">Año: {expediente.year}</div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{expediente.type || "N/A"}</Badge>
                                    </TableCell>
                                    <TableCell>{expediente.origin || "N/A"}</TableCell>
                                    <TableCell className="max-w-[200px] truncate">{expediente.description || "N/A"}</TableCell>
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
                                    <TableCell className="text-xs">
                                        {format(new Date(expediente.createdAt), "dd/MM/yyyy", { locale: es })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/dashboard/expedientes/${expediente.id}`}>
                                                <Button variant="ghost" size="icon">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            {canManage && (
                                                <Link href={`/dashboard/expedientes/${expediente.id}/edit`}>
                                                    <Button variant="ghost" size="icon">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
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
