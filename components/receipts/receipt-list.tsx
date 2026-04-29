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
import { Search, Eye, Edit } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ReceiptListProps {
    receipts: any[];
    canManage: boolean;
}

export function ReceiptList({ receipts, canManage }: ReceiptListProps) {
    const [search, setSearch] = useState("");

    const filtered = receipts.filter(
        (r) =>
            r.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
            r.purchaseOrder?.orderNumber?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar remitos..."
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Remito</TableHead>
                            <TableHead>Orden Asociada</TableHead>
                            <TableHead>Proveedor</TableHead>
                            <TableHead>Expediente</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No se encontraron remitos
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((receipt) => (
                                <TableRow key={receipt.id}>
                                    <TableCell className="font-medium">{receipt.receiptNumber}</TableCell>
                                    <TableCell>{receipt.purchaseOrder?.orderNumber || "N/A"}</TableCell>
                                    <TableCell>{receipt.purchaseOrder?.supplier?.name || receipt.supplier?.name || "N/A"}</TableCell>
                                    <TableCell>{receipt.expediente?.number || "N/A"}</TableCell>
                                    <TableCell>
                                        {format(new Date(receipt.date), "dd/MM/yyyy", { locale: es })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/dashboard/receipts/${receipt.id}`}>
                                                <Button variant="ghost" size="icon" title="Ver detalle">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            {canManage && (
                                                <Link href={`/dashboard/receipts/${receipt.id}/edit`}>
                                                    <Button variant="ghost" size="icon" title="Editar remito">
                                                        <Edit className="h-4 w-4" />
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
