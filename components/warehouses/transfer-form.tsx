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
import { createTransfer } from "@/app/actions/warehouses";
import { getProducts } from "@/app/actions/inventory";
import { useEffect } from "react";

type Warehouse = {
    id: string;
    name: string;
    code: string;
};

type Product = {
    id: string;
    name: string;
    sku: string;
};

interface TransferFormProps {
    warehouses: Warehouse[];
    userId: string;
    defaultFromWarehouseId?: string;
    trigger?: React.ReactNode;
}

export function TransferForm({ warehouses, userId, defaultFromWarehouseId, trigger }: TransferFormProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [products, setProducts] = useState<Product[]>([]);
    const router = useRouter();

    const [formData, setFormData] = useState({
        fromWarehouseId: defaultFromWarehouseId || "",
        toWarehouseId: "",
        productId: "",
        quantity: 1,
        notes: "",
    });

    useEffect(() => {
        if (open) {
            getProducts().then((data: any) => setProducts(data));
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fromWarehouseId || !formData.toWarehouseId || !formData.productId) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (formData.fromWarehouseId === formData.toWarehouseId) {
            toast.error("Source and destination warehouses must be different");
            return;
        }

        startTransition(async () => {
            try {
                await createTransfer({
                    ...formData,
                    userId,
                });
                toast.success("Transfer created successfully");
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
                toast.error(error.message || "Failed to create transfer");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>New Transfer</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Warehouse Transfer</DialogTitle>
                        <DialogDescription>
                            Transfer stock between warehouses
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="fromWarehouse">From Warehouse *</Label>
                            <Select
                                value={formData.fromWarehouseId}
                                onValueChange={(value) => setFormData({ ...formData, fromWarehouseId: value })}
                            >
                                <SelectTrigger id="fromWarehouse">
                                    <SelectValue placeholder="Select source warehouse" />
                                </SelectTrigger>
                                <SelectContent>
                                    {warehouses.filter(w => w.id !== formData.toWarehouseId).map((warehouse) => (
                                        <SelectItem key={warehouse.id} value={warehouse.id}>
                                            {warehouse.code} - {warehouse.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="toWarehouse">To Warehouse *</Label>
                            <Select
                                value={formData.toWarehouseId}
                                onValueChange={(value) => setFormData({ ...formData, toWarehouseId: value })}
                            >
                                <SelectTrigger id="toWarehouse">
                                    <SelectValue placeholder="Select destination warehouse" />
                                </SelectTrigger>
                                <SelectContent>
                                    {warehouses.filter(w => w.id !== formData.fromWarehouseId).map((warehouse) => (
                                        <SelectItem key={warehouse.id} value={warehouse.id}>
                                            {warehouse.code} - {warehouse.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="product">Product *</Label>
                            <Select
                                value={formData.productId}
                                onValueChange={(value) => setFormData({ ...formData, productId: value })}
                            >
                                <SelectTrigger id="product">
                                    <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((product: any) => (
                                        <SelectItem key={product.id} value={product.id}>
                                            {product.sku} - {product.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="quantity">Quantity *</Label>
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
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Optional notes about this transfer..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Creating..." : "Create Transfer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
