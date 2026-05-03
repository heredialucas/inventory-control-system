"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StockAssignmentDialog } from "./stock-assignment-dialog";
import { RestockDialog } from "./restock-dialog";
import {
    MoreHorizontal,
    Pencil,
    PackagePlus,
    Download,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface ProductActionsProps {
    productId: string;
    productName: string;
    productSku: string;
    canEdit: boolean;
    warehouses: { id: string; name: string; code: string }[];
    suppliers?: { id: string; name: string; code: string }[];
    userId: string;
}

export function ProductActions({
    productId,
    productName,
    productSku,
    canEdit,
    warehouses,
    suppliers = [],
    userId
}: ProductActionsProps) {
    const [open, setOpen] = useState(false);
    const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
    const [showRestockDialog, setShowRestockDialog] = useState(false);
    const router = useRouter();

    if (!canEdit) {
        return (
            <Button variant="ghost" size="sm" asChild>
                <Link href={`/dashboard/inventory/${productId}`}>
                    Ver
                </Link>
            </Button>
        );
    }

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

                    {/* 
                        Reingresar Stock se eliminó para forzar el uso de Remitos 
                        con foto y trazabilidad completa.
                    */}

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
                </DropdownMenuContent>
            </DropdownMenu>

            <StockAssignmentDialog
                open={showAssignmentDialog}
                onOpenChange={setShowAssignmentDialog}
                product={{ id: productId, name: productName, sku: productSku }}
                warehouses={warehouses}
                userId={userId}
            />

            <RestockDialog 
                open={showRestockDialog}
                onOpenChange={setShowRestockDialog}
                productId={productId}
                productName={productName}
                warehouses={warehouses}
                suppliers={suppliers}
            />

            </>
    );
}
