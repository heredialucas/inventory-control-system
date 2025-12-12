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
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Category {
    id: string;
    name: string;
}

interface Warehouse {
    id: string;
    code: string;
    name: string;
}

interface Supplier {
    id: string;
    name: string;
    code: string;
}

interface Product {
    id: string;
    sku: string;
    name: string;
    price: number | string;
    stock: number;
    minStock: number;
    categoryId: string | null;
    purchaseCode?: string | null;
    purchaseDate?: string | null;
    purchaseAmount?: number | string | null;
    supplierId?: string | null;
    destination?: string | null;
    receiptImageUrl?: string | null;
    unit?: string | null;
}

interface ProductFormProps {
    categories: Category[];
    warehouses: Warehouse[];
    suppliers?: Supplier[];
    initialData?: Product | null;
}

export function ProductForm({ categories, warehouses, suppliers = [], initialData }: ProductFormProps) {
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
            // Éxito manejado por redirección de acción
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
                    {/* Datos de Compra */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Datos de Compra</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="purchaseCode">Código de Expediente</Label>
                                <Input
                                    id="purchaseCode"
                                    name="purchaseCode"
                                    placeholder="2018/224/25"
                                    defaultValue={initialData?.purchaseCode || ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="purchaseDate">Fecha de Compra</Label>
                                <Input
                                    id="purchaseDate"
                                    name="purchaseDate"
                                    type="date"
                                    defaultValue={initialData?.purchaseDate ? new Date(initialData.purchaseDate).toISOString().split('T')[0] : ""}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="supplierId">Proveedor</Label>
                                <Select name="supplierId" defaultValue={initialData?.supplierId || undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar proveedor" />
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
                            <div className="space-y-2">
                                <Label htmlFor="purchaseAmount">Monto Total</Label>
                                <Input
                                    id="purchaseAmount"
                                    name="purchaseAmount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="259033.98"
                                    defaultValue={initialData?.purchaseAmount ? Number(initialData.purchaseAmount) : ""}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="destination">Destino / Responsable</Label>
                                <Input
                                    id="destination"
                                    name="destination"
                                    placeholder="Automotores - Luis Caro"
                                    defaultValue={initialData?.destination || ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="receiptImageUrl">Imagen del Comprobante</Label>
                                <Input
                                    id="receiptImageUrl"
                                    name="receiptImageUrl"
                                    type="file"
                                    accept="image/*"
                                    className="cursor-pointer"
                                />
                                {initialData?.receiptImageUrl ? (
                                    <div className="mt-2">
                                        <p className="text-xs text-muted-foreground mb-2">Imagen actual:</p>
                                        <div className="relative inline-block">
                                            <img
                                                src={initialData.receiptImageUrl}
                                                alt="Comprobante actual"
                                                className="max-w-xs max-h-32 rounded border object-cover"
                                            />
                                        </div>
                                        <input type="hidden" name="existingReceiptImageUrl" value={initialData.receiptImageUrl} />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Selecciona una nueva imagen para reemplazar la actual
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        Sube una imagen del comprobante de compra (JPG, PNG, etc.)
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Datos del Producto */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Datos del Producto</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="sku">Código *</Label>
                                <Input id="sku" name="sku" placeholder="PROD-001" defaultValue={initialData?.sku} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre *</Label>
                                <Input id="name" name="name" placeholder="Cemento Portland" defaultValue={initialData?.name} required />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="price">Precio (Opcional)</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    defaultValue={initialData?.price ? Number(initialData.price) : ""}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unit">Unidad de Medida</Label>
                                <Select name="unit" defaultValue={initialData?.unit || "U"}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar unidad" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="U">Unidad (U)</SelectItem>
                                        <SelectItem value="Kg">Kilogramo (Kg)</SelectItem>
                                        <SelectItem value="L">Litro (L)</SelectItem>
                                        <SelectItem value="m">Metro (m)</SelectItem>
                                        <SelectItem value="m²">Metro cuadrado (m²)</SelectItem>
                                        <SelectItem value="m³">Metro cúbico (m³)</SelectItem>
                                        <SelectItem value="Caja">Caja</SelectItem>
                                        <SelectItem value="Bolsa">Bolsa</SelectItem>
                                        <SelectItem value="Rollo">Rollo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="minStock">Stock Mínimo (Opcional)</Label>
                                <Input
                                    id="minStock"
                                    name="minStock"
                                    type="number"
                                    min="0"
                                    defaultValue={initialData?.minStock || ""}
                                />
                            </div>
                        </div>

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
                    </div>

                    {!initialData && (
                        <>
                            <Separator />
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground">Stock Inicial</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="initialStock">
                                            Cantidad *
                                        </Label>
                                        <Input
                                            id="initialStock"
                                            name="initialStock"
                                            type="number"
                                            min="1"
                                            placeholder="1"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="initialWarehouseId">
                                            Depósito *
                                        </Label>
                                        <Select name="initialWarehouseId" required>
                                            <SelectTrigger id="initialWarehouseId">
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
                                </div>
                            </div>
                        </>
                    )}

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
            </CardContent >
        </Card >
    );
}
