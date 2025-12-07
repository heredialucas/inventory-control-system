"use client";

import { useState, useTransition } from "react";
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { createPurchaseOrder } from "@/app/actions/purchases";
import Link from "next/link";

interface PurchaseOrderFormProps {
    suppliers: any[];
    warehouses: any[];
    products: any[];
    userId: string;
}

interface OrderItem {
    id: string; // Temporary ID for list management
    productId: string;
    quantity: number;
    unitPrice: number;
}

export function PurchaseOrderForm({ suppliers, warehouses, products, userId }: PurchaseOrderFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [formData, setFormData] = useState({
        supplierId: "",
        warehouseId: "",
        expectedDate: "",
        notes: "",
    });

    const [items, setItems] = useState<OrderItem[]>([
        { id: "1", productId: "", quantity: 1, unitPrice: 0 },
    ]);

    const handleAddItem = () => {
        setItems([
            ...items,
            { id: crypto.randomUUID(), productId: "", quantity: 1, unitPrice: 0 },
        ]);
    };

    const handleRemoveItem = (id: string) => {
        if (items.length === 1) {
            toast.error("Order must have at least one item");
            return;
        }
        setItems(items.filter((item) => item.id !== id));
    };

    const handleItemChange = (id: string, field: keyof OrderItem, value: any) => {
        setItems(
            items.map((item) =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.supplierId || !formData.warehouseId) {
            toast.error("Please select a supplier and warehouse");
            return;
        }

        const validItems = items.filter(
            (item) => item.productId && item.quantity > 0 && item.unitPrice >= 0
        );

        if (validItems.length === 0) {
            toast.error("Please add at least one valid item");
            return;
        }

        if (validItems.length !== items.length) {
            toast.error("Some items are invalid (missing product or invalid quantity)");
            return;
        }

        startTransition(async () => {
            try {
                await createPurchaseOrder({
                    supplierId: formData.supplierId,
                    warehouseId: formData.warehouseId,
                    createdById: userId,
                    expectedDate: formData.expectedDate ? new Date(formData.expectedDate) : undefined,
                    notes: formData.notes,
                    items: validItems.map((item) => ({
                        productId: item.productId,
                        quantity: Number(item.quantity),
                        unitPrice: Number(item.unitPrice),
                    })),
                });
                toast.success("Purchase order created successfully");
                router.push("/dashboard/purchases");
            } catch (error: any) {
                toast.error(error.message || "Failed to create purchase order");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="maximum-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/purchases">
                    <Button variant="ghost" size="icon" type="button">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">New Purchase Order</h1>
                    <p className="text-muted-foreground text-sm">Create a new order for a supplier</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Order Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="supplier">Supplier</Label>
                            <Select
                                onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                    {suppliers.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="warehouse">Target Warehouse</Label>
                            <Select
                                onValueChange={(value) => setFormData({ ...formData, warehouseId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select warehouse" />
                                </SelectTrigger>
                                <SelectContent>
                                    {warehouses.map((w) => (
                                        <SelectItem key={w.id} value={w.id}>
                                            {w.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expectedDate">Expected Date</Label>
                            <Input
                                id="expectedDate"
                                type="date"
                                value={formData.expectedDate}
                                onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                placeholder="Additional notes..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:h-fit">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${calculateTotal().toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            Total estimated cost including all {items.length} items
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" type="submit" disabled={isPending}>
                            <Save className="mr-2 h-4 w-4" />
                            {isPending ? "Creating..." : "Create Order"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Order Items</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {items.map((item, index) => (
                        <div key={item.id} className="flex gap-4 items-end border-b pb-4 last:border-0 last:pb-0">
                            <div className="flex-1 space-y-2">
                                <Label>Product</Label>
                                <Select
                                    value={item.productId}
                                    onValueChange={(value) => handleItemChange(item.id, "productId", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.sku} - {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-24 space-y-2">
                                <Label>Quantity</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))}
                                />
                            </div>
                            <div className="w-32 space-y-2">
                                <Label>Unit Price</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.unitPrice}
                                    onChange={(e) => handleItemChange(item.id, "unitPrice", Number(e.target.value))}
                                />
                            </div>
                            <div className="w-32 space-y-2">
                                <Label>Total</Label>
                                <div className="h-10 flex items-center px-3 border rounded-md bg-muted/50 text-sm">
                                    ${(item.quantity * item.unitPrice).toFixed(2)}
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => handleRemoveItem(item.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </form>
    );
}
