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
import { Plus, Loader2 } from "lucide-react";
import { createSupplier } from "@/app/actions/suppliers";
import { toast } from "sonner";

interface QuickSupplierDialogProps {
    onSupplierCreated?: (supplier: any) => void;
}

export function QuickSupplierDialog({ onSupplierCreated }: QuickSupplierDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [name, setName] = useState("");
    const [code, setCode] = useState("");

    const handleSave = async () => {
        if (!name || !code) {
            toast.error("Nombre y Código son obligatorios");
            return;
        }

        setIsLoading(true);
        try {
            const supplier = await createSupplier({
                name,
                code,
            });

            if (supplier) {
                toast.success("Proveedor creado con éxito");
                if (onSupplierCreated) {
                    onSupplierCreated(supplier);
                }
                setOpen(false);
                // Reset form
                setName("");
                setCode("");
            }
        } catch (error: any) {
            toast.error(error.message || "Error al crear proveedor");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" type="button" size="sm" className="h-7 text-[10px] px-2">
                    <Plus className="mr-1 h-3 w-3" />
                    Nuevo Proveedor
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Proveedor</DialogTitle>
                    <DialogDescription>
                        Carga el proveedor en el catálogo para poder vincularlo al remito.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="s-name">Nombre / Razón Social *</Label>
                        <Input
                            id="s-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Materiales S.A."
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="s-code">CUIT / Código *</Label>
                        <Input
                            id="s-code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Ej: 30-12345678-9"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creando...
                            </>
                        ) : (
                            "Crear Proveedor"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
