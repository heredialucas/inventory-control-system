"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";
import { restockProductAction } from "@/app/actions/inventory";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Warehouse {
    id: string;
    code: string;
    name: string;
}

interface Supplier {
    id: string;
    name: string;
}

interface RestockDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productId: string;
    productName: string;
    warehouses: Warehouse[];
    suppliers?: Supplier[];
}

export function RestockDialog({ open, onOpenChange, productId, productName, warehouses, suppliers = [] }: RestockDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        formData.append("productId", productId);

        const result = await restockProductAction(formData);

        setIsLoading(false);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Stock ingresado correctamente");
            onOpenChange(false);
            router.refresh();
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form action={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Ingresar Stock: {productName}</DialogTitle>
                        <DialogDescription>
                            Registra un nuevo ingreso de mercadería con su comprobante.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="quantity">Cantidad *</Label>
                                <Input
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    min="1"
                                    placeholder="Ej: 50"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="warehouseId">Depósito *</Label>
                                <Select name="warehouseId" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map((w) => (
                                            <SelectItem key={w.id} value={w.id}>
                                                {w.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="supplierId">Proveedor</Label>
                            <Select name="supplierId">
                                <SelectTrigger>
                                    <SelectValue placeholder="Opcional" />
                                </SelectTrigger>
                                <SelectContent>
                                    {suppliers.map(s => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="purchaseCode">Nº Remito/Expediente</Label>
                                <Input id="purchaseCode" name="purchaseCode" placeholder="R-0001" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="purchaseDate">Fecha Comprobante</Label>
                                <Input id="purchaseDate" name="purchaseDate" type="date" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="purchaseAmount">Monto Total</Label>
                                <Input id="purchaseAmount" name="purchaseAmount" type="number" step="0.01" min="0" placeholder="0.00" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="destination">Destino/Responsable</Label>
                                <Input id="destination" name="destination" placeholder="Ej: Sector A" />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="receiptImageUrl">Foto del Comprobante</Label>
                            <Input id="receiptImageUrl" name="receiptImageUrl" type="file" accept="image/*" />
                        </div>
                        
                        <div className="grid gap-2">
                            <Label htmlFor="reason">Motivo/Observaciones</Label>
                            <Input id="reason" name="reason" placeholder="Opcional" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Guardando..." : "Confirmar Ingreso"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
