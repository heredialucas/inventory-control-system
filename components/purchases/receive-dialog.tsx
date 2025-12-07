"use client";

import { useState, useTransition } from "react";
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
import { toast } from "sonner";
import { receivePurchaseOrder } from "@/app/actions/purchases";
import { PackageCheck } from "lucide-react";

interface ReceiveDialogProps {
    order: any;
    userId: string;
    onSuccess?: () => void;
}

export function ReceiveDialog({ order, userId, onSuccess }: ReceiveDialogProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Initialize state with processable items
    const [receiveItems, setReceiveItems] = useState<{ [key: string]: number }>(
        order.items.reduce((acc: any, item: any) => {
            if (item.receivedQty < item.quantity) {
                acc[item.id] = 0;
            }
            return acc;
        }, {})
    );

    const handleQuantityChange = (itemId: string, value: number) => {
        setReceiveItems((prev) => ({
            ...prev,
            [itemId]: value,
        }));
    };

    const handleReceiveAll = () => {
        const fullReceive: any = {};
        order.items.forEach((item: any) => {
            if (item.receivedQty < item.quantity) {
                fullReceive[item.id] = item.quantity - item.receivedQty;
            }
        });
        setReceiveItems(fullReceive);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const itemsToProcess = Object.entries(receiveItems)
            .filter(([_, qty]) => qty > 0)
            .map(([itemId, qty]) => ({
                itemId,
                quantity: qty,
            }));

        if (itemsToProcess.length === 0) {
            toast.error("Please enter quantity to receive for at least one item");
            return;
        }

        // Validate quantities
        for (const { itemId, quantity } of itemsToProcess) {
            const item = order.items.find((i: any) => i.id === itemId);
            if (!item) continue;
            const remaining = item.quantity - item.receivedQty;
            if (quantity > remaining) {
                toast.error(`Cannot receive ${quantity} for ${item.product.name}. Only ${remaining} remaining.`);
                return;
            }
        }

        startTransition(async () => {
            try {
                await receivePurchaseOrder(order.id, userId, itemsToProcess);
                toast.success("Items received successfully");
                setOpen(false);
                // Reset form
                const resetItems: any = {};
                Object.keys(receiveItems).forEach(key => resetItems[key] = 0);
                setReceiveItems(resetItems);
                onSuccess?.();
            } catch (error: any) {
                toast.error(error.message || "Failed to receive items");
            }
        });
    };

    const processableItems = order.items.filter((item: any) => item.receivedQty < item.quantity);

    if (processableItems.length === 0) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PackageCheck className="mr-2 h-4 w-4" />
                    Receive Items
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Receive Inventory</DialogTitle>
                        <DialogDescription>
                            Enter the quantity of items received to update stock in {order.warehouse.name}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex justify-end my-4">
                        <Button type="button" variant="outline" size="sm" onClick={handleReceiveAll}>
                            Receive All Excepted
                        </Button>
                    </div>

                    <div className="space-y-4 py-4">
                        {processableItems.map((item: any) => {
                            const remaining = item.quantity - item.receivedQty;
                            return (
                                <div key={item.id} className="grid grid-cols-[1fr_100px] gap-4 items-center border-b pb-4">
                                    <div>
                                        <div className="font-medium">{item.product.name}</div>
                                        <div className="text-sm text-muted-foreground">SKU: {item.product.sku}</div>
                                        <div className="text-xs mt-1">
                                            Ordered: {item.quantity} | Received: {item.receivedQty} | <span className="font-semibold text-primary">Remaining: {remaining}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor={`qty-${item.id}`} className="sr-only">Receive Qty</Label>
                                        <Input
                                            id={`qty-${item.id}`}
                                            type="number"
                                            min="0"
                                            max={remaining}
                                            value={receiveItems[item.id] || 0}
                                            onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                                            className="text-right"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Procesando..." : "Confirmar Recepción"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
