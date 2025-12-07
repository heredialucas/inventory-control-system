"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { addStockToWarehouse } from "@/app/actions/warehouses";

interface Warehouse {
    id: string;
    name: string;
    code: string;
}

interface StockAssignmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: {
        id: string;
        name: string;
        sku: string;
    };
    warehouses: Warehouse[];
    userId: string;
}

export function StockAssignmentDialog({
    open,
    onOpenChange,
    product,
    warehouses,
    userId,
}: StockAssignmentDialogProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [formData, setFormData] = useState({
        warehouseId: "",
        quantity: 1,
        notes: "",
        isNewStock: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.warehouseId) {
            toast.error("Por favor seleccione un depósito");
            return;
        }

        startTransition(async () => {
            try {
                await addStockToWarehouse({
                    productId: product.id,
                    warehouseId: formData.warehouseId,
                    quantity: formData.quantity,
                    userId,
                    notes: formData.notes,
                    isNewStock: formData.isNewStock,
                });

                toast.success(
                    formData.isNewStock
                        ? "Stock ingresado exitosamente"
                        : "Stock asignado exitosamente"
                );

                onOpenChange(false);
                setFormData({
                    warehouseId: "",
                    quantity: 1,
                    notes: "",
                    isNewStock: false,
                });
                router.refresh();
            } catch (error: any) {
                toast.error(error.message || "Error al asignar stock");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Asignar Stock: {product.name}</DialogTitle>
                        <DialogDescription>
                            Ingrese stock a un depósito. Puede ser una nueva compra o una asignación de stock pendiente.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="bg-primary/5 p-4 rounded-md border border-primary/20 space-y-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isNewStock"
                                    checked={formData.isNewStock}
                                    onChange={(e) => setFormData({ ...formData, isNewStock: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <label
                                        htmlFor="isNewStock"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        ¿Es nuevo ingreso de mercadería?
                                    </label>
                                    <p className="text-[10px] text-muted-foreground">
                                        {formData.isNewStock
                                            ? "SÍ: Suma al Stock Total (Ej: Compra)."
                                            : "NO: Solo mueve de Sin Asignar a Depósito."
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="warehouse">Depósito Destino *</Label>
                            <Select
                                value={formData.warehouseId}
                                onValueChange={(value) => setFormData({ ...formData, warehouseId: value })}
                            >
                                <SelectTrigger id="warehouse">
                                    <SelectValue placeholder="Seleccionar depósito" />
                                </SelectTrigger>
                                <SelectContent>
                                    {warehouses.map((w) => (
                                        <SelectItem key={w.id} value={w.id}>
                                            {w.code} - {w.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="quantity">Cantidad *</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notas</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Referencia, motivo, etc."
                                rows={2}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Procesando..." : "Confirmar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
