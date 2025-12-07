"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2, ArrowLeft, Plus, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import { createDelivery } from "@/app/actions/deliveries";
import { getWarehouseProducts } from "@/app/actions/warehouses";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface DeliveryFormProps {
    schools: any[];
    warehouses: any[];
    userId: string;
}

interface ProductItem {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    maxQuantity: number;
}

export function DeliveryForm({ schools, warehouses, userId }: DeliveryFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isLoadingProducts, startProductLoad] = useTransition();

    // Form State
    const [institutionId, setInstitutionId] = useState("");
    const [warehouseId, setWarehouseId] = useState("");
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<ProductItem[]>([]);

    // Available products in selected warehouse
    const [availableProducts, setAvailableProducts] = useState<any[]>([]);

    // Item adding state
    const [selectedProductId, setSelectedProductId] = useState("");
    const [quantity, setQuantity] = useState(1);

    // Fetch products when warehouse changes
    useEffect(() => {
        if (!warehouseId) {
            setAvailableProducts([]);
            setItems([]); // Clear items if warehouse changes? Yes, to avoid invalid stock.
            return;
        }

        startProductLoad(async () => {
            try {
                const products = await getWarehouseProducts(warehouseId);
                setAvailableProducts(products);
                setItems([]); // Reset items when changing warehouse to ensure validity
            } catch (error) {
                console.error(error);
                toast.error("Error al cargar productos del depósito");
            }
        });
    }, [warehouseId]);

    const handleAddItem = () => {
        if (!selectedProductId) return;

        const product = availableProducts.find(p => p.id === selectedProductId);
        if (!product) return;

        if (quantity <= 0) {
            toast.error("La cantidad debe ser mayor a 0");
            return;
        }

        if (quantity > product.quantity) {
            toast.error(`Stock insuficiente. Disponible: ${product.quantity}`);
            return;
        }

        // Check if already added
        const existingItem = items.find(i => i.productId === selectedProductId);
        if (existingItem) {
            if (existingItem.quantity + quantity > product.quantity) {
                toast.error(`Stock insuficiente. Total en lista: ${existingItem.quantity}, Disponible: ${product.quantity}`);
                return;
            }
            // Update quantity
            setItems(items.map(i =>
                i.productId === selectedProductId
                    ? { ...i, quantity: i.quantity + quantity }
                    : i
            ));
        } else {
            // Add new item
            setItems([...items, {
                productId: product.id,
                productName: product.name,
                sku: product.sku,
                quantity: quantity,
                maxQuantity: product.quantity
            }]);
        }

        // Reset inputs
        setSelectedProductId("");
        setQuantity(1);
    };

    const handleRemoveItem = (productId: string) => {
        setItems(items.filter(i => i.productId !== productId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!institutionId || !warehouseId) {
            toast.error("Seleccione una escuela y un depósito");
            return;
        }

        if (items.length === 0) {
            toast.error("Agregue al menos un producto a la entrega");
            return;
        }

        startTransition(async () => {
            try {
                await createDelivery({
                    institutionId,
                    warehouseId,
                    createdById: userId,
                    notes,
                    items: items.map(i => ({
                        productId: i.productId,
                        quantity: i.quantity
                    }))
                });
                toast.success("Entrega creada correctamente");
                router.push("/dashboard/deliveries");
            } catch (error: any) {
                toast.error(error.message || "Error al crear entrega");
            }
        });
    };

    const selectedProduct = availableProducts.find(p => p.id === selectedProductId);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/deliveries">
                    <Button variant="ghost" size="icon" type="button">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Nueva Entrega</h1>
                    <p className="text-muted-foreground text-sm">
                        Registrar una nueva entrega a escuela
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Detalles Generales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Escuela (Destino)</Label>
                            <Select value={institutionId} onValueChange={setInstitutionId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar escuela" />
                                </SelectTrigger>
                                <SelectContent>
                                    {schools.map(school => (
                                        <SelectItem key={school.id} value={school.id}>
                                            {school.name} ({school.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Depósito de Origen</Label>
                            <Select value={warehouseId} onValueChange={setWarehouseId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar depósito" />
                                </SelectTrigger>
                                <SelectContent>
                                    {warehouses.map(warehouse => (
                                        <SelectItem key={warehouse.id} value={warehouse.id}>
                                            {warehouse.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                * Al cambiar el depósito se reiniciará la lista de productos.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Notas</Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Notas opcionales sobre la entrega..."
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Agregar Productos</CardTitle>
                        <CardDescription>
                            {warehouseId
                                ? "Seleccione productos del stock disponible"
                                : "Seleccione un depósito para ver productos"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1">
                        {isLoadingProducts ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <>
                                <div className="flex gap-4 items-end">
                                    <div className="flex-1 space-y-2">
                                        <Label>Producto</Label>
                                        <Select
                                            value={selectedProductId}
                                            onValueChange={setSelectedProductId}
                                            disabled={!warehouseId}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar producto" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableProducts.map(p => {
                                                    // Calculate remaining stock
                                                    const alreadyAdded = items.find(i => i.productId === p.id)?.quantity || 0;
                                                    const remaining = p.quantity - alreadyAdded;

                                                    return (
                                                        <SelectItem key={p.id} value={p.id} disabled={remaining <= 0}>
                                                            {p.name} (Disp: {remaining})
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-24 space-y-2">
                                        <Label>Cantidad</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={quantity}
                                            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                            disabled={!selectedProductId}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={handleAddItem}
                                        disabled={!selectedProductId}
                                    >
                                        Agregar
                                    </Button>
                                </div>

                                {selectedProduct && (
                                    <div className="text-sm text-muted-foreground mt-2">
                                        SKU: <span className="font-mono">{selectedProduct.sku}</span> |
                                        Stock Real: <strong>{selectedProduct.quantity}</strong> |
                                        En Lista: <strong>{items.find(i => i.productId === selectedProductId)?.quantity || 0}</strong> |
                                        <span className="text-primary font-medium ml-1">
                                            Restante: {selectedProduct.quantity - (items.find(i => i.productId === selectedProductId)?.quantity || 0)}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="mt-6 border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Producto</TableHead>
                                        <TableHead className="text-right">Cant.</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                                No hay ítems agregados
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.map(item => (
                                            <TableRow key={item.productId}>
                                                <TableCell>
                                                    <div className="font-medium">{item.productName}</div>
                                                    <div className="text-xs text-muted-foreground font-mono">{item.sku}</div>
                                                </TableCell>
                                                <TableCell className="text-right">{item.quantity}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        type="button"
                                                        onClick={() => handleRemoveItem(item.productId)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/50 pt-6">
                        <Button type="submit" size="lg" className="w-full" disabled={isPending || items.length === 0}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creando Entrega...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Guardar Entrega
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </form>
    );
}
