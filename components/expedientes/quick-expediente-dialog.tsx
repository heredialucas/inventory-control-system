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
import { createExpediente } from "@/app/actions/expedientes";
import { toast } from "sonner";

interface QuickExpedienteDialogProps {
    onExpedienteCreated?: (expediente: any) => void;
}

export function QuickExpedienteDialog({ onExpedienteCreated }: QuickExpedienteDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [number, setNumber] = useState("");
    const [year, setYear] = useState(new Date().getFullYear().toString());

    const handleSave = async () => {
        if (!number) {
            toast.error("El número de expediente es obligatorio");
            return;
        }

        setIsLoading(true);
        try {
            const expediente = await createExpediente({
                number,
                year: parseInt(year),
                status: "ABIERTO",
            });

            if (expediente) {
                toast.success("Expediente creado con éxito");
                if (onExpedienteCreated) {
                    onExpedienteCreated(expediente);
                }
                setOpen(false);
                // Reset form
                setNumber("");
                setYear(new Date().getFullYear().toString());
            }
        } catch (error: any) {
            toast.error(error.message || "Error al crear expediente");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" type="button" size="sm" className="h-7 text-[10px] px-2">
                    <Plus className="mr-1 h-3 w-3" />
                    Nuevo Expediente
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Expediente</DialogTitle>
                    <DialogDescription>
                        Carga el número de expediente para vincularlo al remito.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="e-number">Número de Expediente *</Label>
                        <Input
                            id="e-number"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            placeholder="Ej: 2024-123456"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="e-year">Año</Label>
                        <Input
                            id="e-year"
                            type="number"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
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
                            "Crear Expediente"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
