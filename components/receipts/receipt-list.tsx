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
import { Card, CardContent } from "@/components/ui/card";
import { Search, Eye, Edit, Image as ImageIcon, Trash2, Loader2, FileText } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { deleteReceipt } from "@/app/actions/receipts";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ReceiptListProps {
    receipts: any[];
    canManage: boolean;
}

export function ReceiptList({ receipts, canManage }: ReceiptListProps) {
    const [search, setSearch] = useState("");
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        try {
            setIsDeleting(id);
            await deleteReceipt(id);
        } catch (error) {
            console.error("Error deleting receipt:", error);
            alert("Error al eliminar el remito");
        } finally {
            setIsDeleting(null);
        }
    };

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

            {/* Desktop Table */}
            <div className="hidden md:block border rounded-md">
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
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {receipt.receiptNumber}
                                            {receipt.imageUrl && (
                                                <span title="Tiene imagen adjunta">
                                                    <ImageIcon className="h-3 w-3 text-muted-foreground" />
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
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
                                                <>
                                                    <Link href={`/dashboard/receipts/${receipt.id}/edit`}>
                                                        <Button variant="ghost" size="icon" title="Editar remito">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Eliminar remito"
                                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                disabled={isDeleting === receipt.id}
                                                            >
                                                                {isDeleting === receipt.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Trash2 className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Esta acción eliminará el remito y revertirá el stock ingresado.
                                                                    Si el remito está asociado a una Orden de Compra, el estado de la misma será actualizado.
                                                                    Esta acción no se puede deshacer.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(receipt.id)}
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                >
                                                                    Eliminar
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {filtered.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No se encontraron remitos</h3>
                            <p className="text-sm text-muted-foreground">
                                No hay remitos que mostrar
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filtered.map((receipt) => (
                        <Card key={receipt.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium">{receipt.receiptNumber}</h4>
                                            {receipt.imageUrl && (
                                                <ImageIcon className="h-3 w-3 text-muted-foreground" />
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(receipt.date), "dd/MM/yyyy", { locale: es })}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                    <div>
                                        <p className="text-muted-foreground">Orden</p>
                                        <p className="mt-1">{receipt.purchaseOrder?.orderNumber || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Proveedor</p>
                                        <p className="mt-1">{receipt.purchaseOrder?.supplier?.name || receipt.supplier?.name || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Expediente</p>
                                        <Badge variant="secondary" className="mt-1">{receipt.expediente?.number || "N/A"}</Badge>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-3 border-t">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/dashboard/receipts/${receipt.id}`}>
                                            <Eye className="h-4 w-4 mr-1" />
                                            Ver
                                        </Link>
                                    </Button>
                                    {canManage && (
                                        <>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/dashboard/receipts/${receipt.id}/edit`}>
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Editar
                                                </Link>
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        disabled={isDeleting === receipt.id}
                                                    >
                                                        {isDeleting === receipt.id ? (
                                                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4 mr-1" />
                                                        )}
                                                        Eliminar
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta acción eliminará el remito y revertirá el stock ingresado.
                                                            Si el remito está asociado a una Orden de Compra, el estado de la misma será actualizado.
                                                            Esta acción no se puede deshacer.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(receipt.id)}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Eliminar
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
