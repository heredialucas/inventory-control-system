"use client";

import { useState, useTransition, useRef } from "react";
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Save, ArrowLeft, Loader2, ShoppingCart, Package, FileText, Building2, Calendar, Upload } from "lucide-react";
import { toast } from "sonner";
import { createPurchaseOrder } from "@/app/actions/purchases";
import Link from "next/link";
import { QuickProductDialog } from "@/components/inventory/quick-product-dialog";
import { QuickSupplierDialog } from "@/components/suppliers/quick-supplier-dialog";
import { QuickExpedienteDialog } from "@/components/expedientes/quick-expediente-dialog";

interface PurchaseOrderFormProps {
    suppliers: any[];
    warehouses: any[];
    products: any[];
    categories?: any[];
    expedientes: any[];
    userId: string;
}

interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    productSku: string;
    quantity: number;
    unitPrice: number;
}

export function PurchaseOrderForm({ suppliers: initialSuppliers, warehouses, products: initialProducts, categories = [], expedientes: initialExpedientes, userId }: PurchaseOrderFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [allProducts, setAllProducts] = useState(initialProducts);
    const [allSuppliers, setAllSuppliers] = useState(initialSuppliers);
    const [allExpedientes, setAllExpedientes] = useState(initialExpedientes);
    const [allCategories, setAllCategories] = useState(categories);

    const [formData, setFormData] = useState({
        supplierId: "",
        warehouseId: "",
        expedienteId: "",
        expectedDate: "",
        notes: "",
    });

    const [selectedProductId, setSelectedProductId] = useState("");
    const [items, setItems] = useState<OrderItem[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        toast.success(`Archivo "${file.name}" subido correctamente (${(file.size / 1024).toFixed(1)} KB)`);
        e.target.value = "";
    };

    const handleProductCreated = (newProduct: any) => {
        setAllProducts(prev => [...prev, newProduct]);
        setItems(prev => [...prev, {
            id: crypto.randomUUID(),
            productId: newProduct.id,
            productName: newProduct.name,
            productSku: newProduct.sku,
            quantity: 1,
            unitPrice: Number(newProduct.price) || 0
        }]);
        toast.success(`${newProduct.name} creado e incorporado a la orden`);
    };

    const handleSupplierCreated = (newSupplier: any) => {
        setAllSuppliers(prev => [...prev, newSupplier]);
        setFormData(prev => ({ ...prev, supplierId: newSupplier.id }));
    };

    const handleExpedienteCreated = (newExpediente: any) => {
        setAllExpedientes(prev => [...prev, newExpediente]);
        setFormData(prev => ({ ...prev, expedienteId: newExpediente.id }));
    };

    const handleAddProduct = (productId: string) => {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;

        if (items.find(i => i.productId === productId)) {
            toast.error("Este producto ya está en la lista");
            return;
        }

        setItems(prev => [...prev, {
            id: crypto.randomUUID(),
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            quantity: 1,
            unitPrice: Number(product.price) || 0
        }]);
        setSelectedProductId("");
    };

    const handleRemoveItem = (id: string) => {
        if (items.length === 1) {
            toast.error("La orden debe tener al menos un artículo");
            return;
        }
        setItems(items.filter((item) => item.id !== id));
    };

    const updateItemQty = (id: string, quantity: number) => {
        setItems(items.map(item => item.id === id ? { ...item, quantity } : item));
    };

    const updateItemPrice = (id: string, unitPrice: number) => {
        setItems(items.map(item => item.id === id ? { ...item, unitPrice } : item));
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.supplierId || !formData.warehouseId) {
            toast.error("Selecciona un proveedor y almacén");
            return;
        }

        if (items.length === 0) {
            toast.error("Agrega al menos un producto");
            return;
        }

        const validItems = items.filter(item => item.productId && item.quantity > 0 && item.unitPrice >= 0);
        if (validItems.length !== items.length) {
            toast.error("Algunos artículos son inválidos");
            return;
        }

        startTransition(async () => {
            try {
                await createPurchaseOrder({
                    supplierId: formData.supplierId,
                    warehouseId: formData.warehouseId,
                    createdById: userId,
                    expedienteId: formData.expedienteId || undefined,
                    expectedDate: formData.expectedDate ? new Date(formData.expectedDate) : undefined,
                    notes: formData.notes,
                    items: validItems.map((item) => ({
                        productId: item.productId,
                        quantity: Number(item.quantity),
                        unitPrice: Number(item.unitPrice),
                    })),
                });
                toast.success("Orden de compra creada exitosamente");
                router.push("/dashboard/purchases");
            } catch (error: any) {
                toast.error(error.message || "Error al crear la orden de compra");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto space-y-8 pb-20">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b pb-4 md:pb-6">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/purchases">
                        <Button variant="ghost" size="icon" type="button" className="rounded-full h-10 w-10">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold tracking-tight">Nueva Orden de Compra</h1>
                        <p className="text-muted-foreground text-sm">Crear una nueva orden para un proveedor</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3 grid-cols-1">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-md border-primary/10 overflow-hidden">
                        <div className="h-1 bg-primary" />
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-primary" />
                                Datos de la Orden
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="supplier">Proveedor *</Label>
                                    <QuickSupplierDialog onSupplierCreated={handleSupplierCreated} />
                                </div>
                                <Select
                                    value={formData.supplierId}
                                    onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
                                >
                                    <SelectTrigger className="bg-background">
                                        <SelectValue placeholder="Seleccionar proveedor..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allSuppliers.map((s) => (
                                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="warehouse">Almacén Destino *</Label>
                                <Select
                                    value={formData.warehouseId}
                                    onValueChange={(value) => setFormData({ ...formData, warehouseId: value })}
                                >
                                    <SelectTrigger className="bg-background">
                                        <SelectValue placeholder="Seleccionar almacén..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map((w) => (
                                            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="expediente">Expediente</Label>
                                    <QuickExpedienteDialog onExpedienteCreated={handleExpedienteCreated} />
                                </div>
                                <Select
                                    value={formData.expedienteId}
                                    onValueChange={(value) => setFormData({ ...formData, expedienteId: value === "none" ? "" : value })}
                                >
                                    <SelectTrigger className="bg-background">
                                        <SelectValue placeholder="Seleccionar expediente..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Sin expediente</SelectItem>
                                        {allExpedientes.map((e: any) => (
                                            <SelectItem key={e.id} value={e.id}>{e.number} ({e.year})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expectedDate">Fecha Esperada</Label>
                                <Input
                                    id="expectedDate"
                                    type="date"
                                    value={formData.expectedDate}
                                    onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notas</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Notas adicionales..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="min-h-[80px]"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md border-primary/10">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Package className="h-5 w-5 text-primary" />
                                    Artículos a Solicitar
                                </CardTitle>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="h-4 w-4" />
                                    Subir Excel
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col sm:flex-row gap-3 bg-muted/40 p-3 sm:p-4 rounded-lg border">
                                <div className="flex-1">
                                    <Select
                                        value={selectedProductId}
                                        onValueChange={(val) => {
                                            if (val && val !== "placeholder") {
                                                handleAddProduct(val);
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="bg-background h-12 text-base">
                                            <SelectValue placeholder="Buscar y agregar producto..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allProducts.length === 0 ? (
                                                <SelectItem value="placeholder" disabled>No hay productos cargados</SelectItem>
                                            ) : (
                                                allProducts.map((p: any) => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        <div className="flex flex-col w-full">
                                                            <span>{p.name}</span>
                                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                                <span className="font-mono">{p.sku}</span>
                                                                <span>${Number(p.price || 0).toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <QuickProductDialog
                                    categories={allCategories}
                                    onProductCreated={handleProductCreated}
                                />
                            </div>

                            <div className="rounded-xl border overflow-hidden">
                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader className="bg-muted/80">
                                            <TableRow>
                                                <TableHead className="font-bold">Producto</TableHead>
                                                <TableHead className="w-[100px] text-center font-bold">Cantidad</TableHead>
                                                <TableHead className="w-[100px] text-center font-bold">Precio Unit.</TableHead>
                                                <TableHead className="w-[100px] text-center font-bold">Total</TableHead>
                                                <TableHead className="w-[50px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Package className="h-10 w-10 opacity-20" />
                                                            <p>La lista está vacía</p>
                                                            <p className="text-xs">Usa el buscador superior para agregar productos</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                items.map((item) => (
                                                    <TableRow key={item.id} className="hover:bg-muted/20">
                                                        <TableCell>
                                                            <div className="font-semibold text-primary">{item.productName}</div>
                                                            <div className="text-xs text-muted-foreground font-mono">{item.productSku}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                value={item.quantity}
                                                                onChange={(e) => updateItemQty(item.id, parseInt(e.target.value) || 0)}
                                                                className="text-right font-bold"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.unitPrice}
                                                                onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                                                                className="text-right"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right font-bold">
                                                            ${(item.quantity * item.unitPrice).toFixed(2)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleRemoveItem(item.id)}
                                                                className="text-destructive hover:bg-destructive/10"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="md:hidden space-y-3 p-3">
                                    {items.length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <Package className="h-10 w-10 opacity-20" />
                                                <p>La lista está vacía</p>
                                                <p className="text-xs">Usa el buscador para agregar productos</p>
                                            </div>
                                        </div>
                                    ) : (
                                        items.map((item) => (
                                            <div key={item.id} className="bg-muted/30 rounded-lg p-3 space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-semibold text-primary text-sm truncate">{item.productName}</div>
                                                        <div className="text-xs text-muted-foreground font-mono">{item.productSku}</div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        className="text-destructive hover:bg-destructive/10 h-8 w-8 shrink-0"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-muted-foreground">Cantidad</Label>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItemQty(item.id, parseInt(e.target.value) || 0)}
                                                            className="text-right font-bold h-9"
                                                        />
                                                    </div>
                                                    <div className="space-y-1 col-span-2">
                                                        <Label className="text-xs text-muted-foreground">Precio Unit.</Label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.unitPrice}
                                                            onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                                                            className="text-right h-9"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Total:</span>
                                                    <span className="font-bold text-primary">${(item.quantity * item.unitPrice).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="shadow-md border-primary/10">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Resumen de la Orden
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Artículos:</span>
                                <span className="font-semibold">{items.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total Estimado:</span>
                                <span className="text-2xl font-bold text-primary">${calculateTotal().toFixed(2)}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full h-14 text-lg font-black shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                disabled={isPending || items.length === 0 || !formData.supplierId || !formData.warehouseId}
                            >
                                {isPending ? (
                                    <div className="flex flex-col items-center">
                                        <Loader2 className="h-5 w-5 animate-spin mb-1" />
                                        <span className="text-xs font-normal">Creando...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Save className="h-5 w-5" />
                                        CREAR ORDEN
                                    </div>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="shadow-md border-primary/10">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Ayuda</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>• Puedes crear productos, proveedores o expedientes sin salir del formulario</p>
                            <p>• Los productos creados se agregarán automáticamente a la lista</p>
                            <p>• Una vez creada la orden, podrás recibirla parcialmente</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
