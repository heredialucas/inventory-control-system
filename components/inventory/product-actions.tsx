"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StockAssignmentDialog } from "./stock-assignment-dialog";
import {
    MoreHorizontal,
    Pencil,
    Trash,
    PackagePlus
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteProductAction } from "@/app/actions/inventory";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProductActionsProps {
    productId: string;
    productName: string;
    productSku: string;
    canEdit: boolean;
    canDelete: boolean;
    warehouses: { id: string; name: string; code: string }[];
    userId: string;
}

export function ProductActions({
    productId,
    productName,
    productSku,
    canEdit,
    canDelete,
    warehouses,
    userId
}: ProductActionsProps) {
    const [open, setOpen] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    if (!canEdit && !canDelete) return null;

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteProductAction(productId);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Producto eliminado exitosamente");
                router.refresh();
            }
        } catch (error) {
            toast.error("Error al eliminar el producto");
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    return (
        <>
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href={`/dashboard/inventory/${productId}`}>
                            Ver Detalles
                        </Link>
                    </DropdownMenuItem>

                    {/* {canEdit && (
                        <DropdownMenuItem
                            onSelect={(e) => {
                                e.preventDefault();
                                setShowAssignmentDialog(true);
                                setOpen(false);
                            }}
                        >
                            <PackagePlus className="mr-2 h-4 w-4" />
                            Asignar Stock
                        </DropdownMenuItem>
                    )} */}

                    {canEdit && (
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/inventory/${productId}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                            </Link>
                        </DropdownMenuItem>
                    )}
                    {canDelete && (
                        <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onSelect={(e) => {
                                e.preventDefault();
                                setShowDeleteDialog(true);
                                setOpen(false);
                            }}
                        >
                            <Trash className="mr-2 h-4 w-4" />
                            Eliminar
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <StockAssignmentDialog
                open={showAssignmentDialog}
                onOpenChange={setShowAssignmentDialog}
                product={{ id: productId, name: productName, sku: productSku }}
                warehouses={warehouses}
                userId={userId}
            />

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el producto
                            y todos sus datos asociados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
