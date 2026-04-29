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
import { Plus, Loader2 } from "lucide-react";
import { quickCreateProductAction } from "@/app/actions/inventory";
import { toast } from "sonner";

interface QuickProductDialogProps {
    categories: any[];
    onProductCreated?: (product: any) => void;
}

export function QuickProductDialog({ categories, onProductCreated }: QuickProductDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    const [name, setName] = useState("");
    const [sku, setSku] = useState("");
    const [price, setPrice] = useState("0");
    const [categoryId, setCategoryId] = useState("");
    const [newCategoryName, setNewCategoryName] = useState("");

    const handleSave = async () => {
        if (!name || !sku) {
            toast.error("Nombre y SKU son obligatorios");
            return;
        }

        if (!isCreatingCategory && !categoryId) {
            toast.error("Seleccione una categoría o cree una nueva");
            return;
        }

        if (isCreatingCategory && !newCategoryName) {
            toast.error("Ingrese el nombre de la nueva categoría");
            return;
        }

        setIsLoading(true);
        try {
            const result = await quickCreateProductAction({
                name,
                sku,
                price: parseFloat(price) || 0,
                categoryId: isCreatingCategory ? undefined : categoryId,
                newCategoryName: isCreatingCategory ? newCategoryName : undefined,
            });

            if (result.success && result.product) {
                toast.success("Producto creado con éxito");
                if (onProductCreated) {
                    onProductCreated(result.product);
                }
                setOpen(false);
                // Reset form
                setName("");
                setSku("");
                setPrice("0");
                setCategoryId("");
                setNewCategoryName("");
                setIsCreatingCategory(false);
            } else {
                toast.error(result.error || "Error al crear producto");
            }
        } catch (error) {
            toast.error("Error inesperado");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" type="button" className="shrink-0 shadow-sm h-12 px-6 font-semibold border-primary/20 border">
                    <Plus className="mr-2 h-5 w-5 text-primary" />
                    Nuevo Producto
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Producto al Vuelo</DialogTitle>
                    <DialogDescription>
                        Carga el producto en el catálogo y agrégalo al remito actual.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre del Producto *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Ladrillo Hueco 12x18x33"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="sku">SKU / Código *</Label>
                        <Input
                            id="sku"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            placeholder="Ej: LAD-001"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="price">Precio Estimado (Unidad)</Label>
                        <Input
                            id="price"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label>Categoría *</Label>
                            <Button 
                                variant="link" 
                                size="sm" 
                                className="h-auto p-0 text-xs" 
                                type="button"
                                onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                            >
                                {isCreatingCategory ? "Seleccionar existente" : "+ Crear nueva"}
                            </Button>
                        </div>
                        {isCreatingCategory ? (
                            <Input
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Nombre de la nueva categoría"
                                autoFocus
                            />
                        ) : (
                            <Select value={categoryId} onValueChange={setCategoryId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
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
                            "Crear y Agregar"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
