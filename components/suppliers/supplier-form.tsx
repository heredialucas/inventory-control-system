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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createSupplier, updateSupplier } from "@/app/actions/suppliers";
import { Supplier } from "@prisma/client";

interface SupplierFormProps {
    supplier?: Supplier;
    trigger?: React.ReactNode;
}

export function SupplierForm({ supplier, trigger }: SupplierFormProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: supplier?.name || "",
        code: supplier?.code || "",
        email: supplier?.email || "",
        phone: supplier?.phone || "",
        address: supplier?.address || "",
        contactName: supplier?.contactName || "",
        notes: supplier?.notes || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        startTransition(async () => {
            try {
                if (supplier) {
                    await updateSupplier(supplier.id, formData);
                    toast.success("Proveedor actualizado exitosamente");
                } else {
                    await createSupplier(formData);
                    toast.success("Proveedor creado exitosamente");
                }
                setOpen(false);
                router.refresh();
            } catch (error: any) {
                toast.error(error.message || "Ocurrió un error");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>{supplier ? "Editar" : "Agregar Proveedor"}</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{supplier ? "Editar Proveedor" : "Agregar Nuevo Proveedor"}</DialogTitle>
                        <DialogDescription>
                            {supplier ? "Actualizar información del proveedor" : "Crear un nuevo proveedor"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Nombre del proveedor"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="code">Código *</Label>
                                <Input
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="PROV-001"
                                    required
                                    maxLength={20}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="proveedor@ejemplo.com"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+54 9 11 1234 5678"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contactName">Persona de Contacto</Label>
                            <Input
                                id="contactName"
                                value={formData.contactName}
                                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                placeholder="Nombre del contacto"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Dirección</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Calle 123, Ciudad"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notas</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Notas adicionales..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Guardando..." : supplier ? "Actualizar" : "Crear"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
