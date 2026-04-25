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
import { Textarea } from "@/components/ui/textarea";
import { createCategoryAction, updateCategoryAction } from "@/app/actions/inventory";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CategoryFormProps {
    trigger?: React.ReactNode;
    category?: {
        id: string;
        name: string;
        description: string | null;
    };
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function CategoryForm({ trigger, category, open: externalOpen, onOpenChange: setExternalOpen }: CategoryFormProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    
    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const setOpen = setExternalOpen !== undefined ? setExternalOpen : setInternalOpen;
    
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const isEditing = !!category;

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        
        let result;
        if (isEditing && category) {
            result = await updateCategoryAction(category.id, formData);
        } else {
            result = await createCategoryAction(formData);
        }

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(isEditing ? "Categoría actualizada exitosamente" : "Categoría creada exitosamente");
            setOpen(false);
            router.refresh();
        }
        setIsLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger ? (
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
            ) : !isEditing ? (
                <DialogTrigger asChild>
                    <Button>Nueva Categoría</Button>
                </DialogTrigger>
            ) : null}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar Categoría" : "Crear Categoría"}</DialogTitle>
                    <DialogDescription>
                        {isEditing 
                            ? "Modifique los detalles de la categoría." 
                            : "Ingrese los detalles de la nueva categoría de productos."}
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input 
                                id="name" 
                                name="name" 
                                defaultValue={category?.name}
                                placeholder="Ej: Materiales de Construcción" 
                                required 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={category?.description || ""}
                                placeholder="Descripción opcional de la categoría"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
