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
        <form action={handleSubmit} className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Datos de Compra - Solo visible al crear un nuevo producto con stock inicial */}
                {!initialData && (
                    <Card className="flex-1">
                        <CardHeader>
                            <CardTitle className="text-lg">Datos de Ingreso</CardTitle>
                            <CardDescription>Información del comprobante y proveedor para el stock inicial</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="purchaseCode">Código de Expediente o Remito</Label>
                                    <Input
                                        id="purchaseCode"
                                        name="purchaseCode"
                                        placeholder="2018/224/25 o R-0001"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="purchaseDate">Fecha del Comprobante</Label>
                                    <Input
                                        id="purchaseDate"
                                        name="purchaseDate"
                                        type="date"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="supplierId">Proveedor</Label>
                                <Select name="supplierId">
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
                                <Label htmlFor="purchaseAmount">Monto Total del Ingreso</Label>
                                <Input
                                    id="purchaseAmount"
                                    name="purchaseAmount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="Total de la factura"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="destination">Destino / Responsable</Label>
                                <Input
                                    id="destination"
                                    name="destination"
                                    placeholder="Ej: Automotores - Luis Caro"
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
                                <p className="text-xs text-muted-foreground mt-1">
                                    Formatos: JPG, PNG.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Datos del Producto */}
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Datos del Producto</CardTitle>
                        <CardDescription>Detalles técnicos y valor unitario</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sku">Código (SKU) *</Label>
                                <Input id="sku" name="sku" placeholder="PROD-001" defaultValue={initialData?.sku} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre del Producto *</Label>
                                <Input id="name" name="name" placeholder="Cemento Portland" defaultValue={initialData?.name} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Precio por Unidad (Opcional)</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    defaultValue={initialData?.price ? Number(initialData.price) : ""}
                                    placeholder="0.00"
                                />
                                <p className="text-[10px] text-muted-foreground italic">Valor por unidad individual</p>
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
                            <Label htmlFor="minStock">Stock Mínimo de Alerta</Label>
                            <Input
                                id="minStock"
                                name="minStock"
                                type="number"
                                min="0"
                                defaultValue={initialData?.minStock || ""}
                                placeholder="Ej: 5"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {!initialData && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Stock Inicial</CardTitle>
                        <CardDescription>Cantidad disponible al momento del alta</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="initialStock">Cantidad ingresada *</Label>
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
                                <Label htmlFor="initialWarehouseId">Depósito de destino *</Label>
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
                    </CardContent>
                </Card>
            )}

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <div className="flex justify-end gap-4 p-4">
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => router.back()}
                    disabled={isLoading}
                >
                    Cancelar
                </Button>
                <Button type="submit" size="lg" disabled={isLoading}>
                    {isLoading ? "Guardando..." : initialData ? "Actualizar Producto" : "Guardar Producto"}
                </Button>
            </div>
        </form>
    );
}
