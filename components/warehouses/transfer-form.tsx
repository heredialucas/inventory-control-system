"use client";

import { useState, useTransition, useEffect } from "react"; // Added useEffect explicitly if missing
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createTransfer, addStockToWarehouse, getWarehouseProducts } from "@/app/actions/warehouses";

type Warehouse = {
    id: string;
    name: string;
    code: string;
};

type Product = {
    id: string;
    name: string;
    sku: string;
    quantity?: number; // Available quantity in source
};

interface TransferFormProps {
    warehouses: Warehouse[];
    userId: string;
    defaultFromWarehouseId?: string;
    trigger?: React.ReactNode;
    isIngreso?: boolean;
}

export function TransferForm({ warehouses, userId, defaultFromWarehouseId, trigger, isIngreso = false }: TransferFormProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        fromWarehouseId: defaultFromWarehouseId || "",
        toWarehouseId: "",
        productId: "",
        quantity: 1,
        notes: "",
    });

    // Fetch products when source warehouse changes
    useEffect(() => {
        if (!open) return;

        const fetchProducts = async () => {
            if (!isIngreso && !formData.fromWarehouseId) {
                setProducts([]);
                return;
            }

            setIsLoadingProducts(true);
            try {
                const sourceId = isIngreso ? "unassigned" : formData.fromWarehouseId;
                const data = await getWarehouseProducts(sourceId);
                setProducts(data);
            } catch (error) {
                toast.error("Error al cargar productos");
                setProducts([]);
            } finally {
                setIsLoadingProducts(false);
            }
        };

        fetchProducts();
    }, [formData.fromWarehouseId, open, isIngreso]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if ((!isIngreso && !formData.fromWarehouseId) || !formData.toWarehouseId || !formData.productId) {
            toast.error("Por favor complete todos los campos requeridos");
            return;
        }

        if (!isIngreso && formData.fromWarehouseId === formData.toWarehouseId) {
            toast.error("El depósito de origen y destino deben ser diferentes");
            return;
        }

        // Validate quantity against available stock (only for transfers)
        if (!isIngreso) {
            const selectedProduct = products.find(p => p.id === formData.productId);
            if (selectedProduct && selectedProduct.quantity !== undefined && formData.quantity > selectedProduct.quantity) {
                toast.error(`Cantidad excede el stock disponible (${selectedProduct.quantity})`);
                return;
            }
        }

        startTransition(async () => {
            try {
                if (isIngreso) {
                    await addStockToWarehouse({
                        warehouseId: formData.toWarehouseId,
                        productId: formData.productId,
                        quantity: formData.quantity,
                        userId,
                        notes: formData.notes,
                        isNewStock: true,
                    });
                    toast.success("Ingreso registrado exitosamente");
                } else {
                    await createTransfer({
                        ...formData,
                        userId,
                    });
                    toast.success("Transferencia creada exitosamente");
                }

                setOpen(false);
                setFormData({
                    fromWarehouseId: defaultFromWarehouseId || "",
                    toWarehouseId: "",
                    productId: "",
                    quantity: 1,
                    notes: "",
                });
                router.refresh();
            } catch (error: any) {
                toast.error(error.message || "Error al realizar la operación");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>Nueva Transferencia</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            Nueva Transferencia
                        </DialogTitle>
                        <DialogDescription>
                            Mover stock entre depósitos existentes.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="fromWarehouse">Origen *</Label>
                            <Select
                                value={formData.fromWarehouseId}
                                onValueChange={(value) => {
                                    setFormData(prev => ({ ...prev, fromWarehouseId: value, productId: "" }));
                                }}
                            >
                                <SelectTrigger id="fromWarehouse">
                                    <SelectValue placeholder="Seleccionar origen" />
                                </SelectTrigger>
                                <SelectContent>
                                    {warehouses.filter(w => w.id !== formData.toWarehouseId).map((warehouse) => (
                                        <SelectItem key={warehouse.id} value={warehouse.id}>
                                            🔄 Transferir desde {warehouse.code}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="toWarehouse">
                                {isIngreso ? "Depósito Destino *" : "Hacia Depósito *"}
                            </Label>
                            <Select
                                value={formData.toWarehouseId}
                                onValueChange={(value) => setFormData({ ...formData, toWarehouseId: value })}
                            >
                                <SelectTrigger id="toWarehouse">
                                    <SelectValue placeholder="Seleccionar destino" />
                                </SelectTrigger>
                                <SelectContent>
                                    {warehouses
                                        .filter(w => w.id !== formData.fromWarehouseId)
                                        .map((warehouse) => (
                                            <SelectItem key={warehouse.id} value={warehouse.id}>
                                                {warehouse.code} - {warehouse.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="product">Producto *</Label>
                            <Select
                                value={formData.productId}
                                onValueChange={(value) => setFormData({ ...formData, productId: value })}
                                disabled={!formData.fromWarehouseId || isLoadingProducts}
                            >
                                <SelectTrigger id="product">
                                    <SelectValue placeholder={isLoadingProducts ? "Cargando..." : "Seleccionar producto"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                            {formData.fromWarehouseId ? "No hay productos disponibles" : "Seleccione origen primero"}
                                        </div>
                                    ) : (
                                        products.map((product) => (
                                            <SelectItem key={product.id} value={product.id}>
                                                <div className="flex justify-between w-full min-w-[200px] gap-4">
                                                    <span>{product.sku} - {product.name}</span>
                                                    {product.quantity !== undefined && (
                                                        <span className={isIngreso ? "text-primary font-medium" : "text-muted-foreground"}>
                                                            {isIngreso ? `(Stock total: ${product.quantity})` : `(Disp: ${product.quantity})`}
                                                        </span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            {isIngreso && (
                                <p className="text-[10px] text-muted-foreground">
                                    * Se muestran todos los productos del sistema.
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="quantity">Cantidad *</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notas / Referencia</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder={isIngreso ? "Ej: Factura #1234, Compra a proveedor X..." : "Motivo de la transferencia..."}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isPending} className={isIngreso ? "bg-primary hover:bg-primary/90" : ""}>
                            {isPending ? "Procesando..." : (isIngreso ? "Confirmar Ingreso" : "Crear Transferencia")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
