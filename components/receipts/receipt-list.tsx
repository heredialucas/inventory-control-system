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
import { Search, Eye, Edit, Image as ImageIcon, Trash2, Loader2 } from "lucide-react";
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
        </div>
    );
}
