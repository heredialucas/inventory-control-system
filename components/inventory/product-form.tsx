"use client";

import { createProductAction, updateProductAction } from "@/app/actions/inventory";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Category {
    id: string;
    name: string;
}

interface Product {
    id: string;
    sku: string;
    name: string;
    price: number | string; // serialized Decimal
    minStock: number;
    categoryId: string | null;
}

interface ProductFormProps {
    categories: Category[];
    initialData?: Product | null;
}

export function ProductForm({ categories, initialData }: ProductFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError(null);

        let result;
        if (initialData) {
            result = await updateProductAction(initialData.id, formData);
        } else {
            result = await createProductAction(formData);
        }

        if (result?.error) {
            setError(result.error);
            setIsLoading(false);
        } else {
            // Success handled by action redirect
        }
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{initialData ? "Editar Producto" : "Nuevo Producto"}</CardTitle>
                <CardDescription>{initialData ? "Modifique los detalles del producto" : "Ingrese los detalles del producto"}</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU</Label>
                            <Input id="sku" name="sku" placeholder="PROD-001" defaultValue={initialData?.sku} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Precio</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                defaultValue={initialData?.price ? Number(initialData.price) : undefined}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input id="name" name="name" placeholder="Cemento Portland" defaultValue={initialData?.name} required />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="categoryId">Categoría</Label>
                            <Select name="categoryId" defaultValue={initialData?.categoryId || undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="minStock">Stock Mínimo</Label>
                            <Input id="minStock" name="minStock" type="number" defaultValue={initialData?.minStock || 0} />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Guardando..." : "Guardar Producto"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
