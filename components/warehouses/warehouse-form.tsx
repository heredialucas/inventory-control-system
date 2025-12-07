"use client";

import { useState, useTransition, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createWarehouse, updateWarehouse } from "@/app/actions/warehouses";
import { Warehouse } from "@prisma/client";

interface WarehouseFormProps {
    warehouse?: Warehouse & { [key: string]: any };
    trigger?: React.ReactNode;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function WarehouseForm({ warehouse, trigger, isOpen, onOpenChange }: WarehouseFormProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Use external control if provided, otherwise use internal state
    const open = isOpen ?? internalOpen;
    const setOpen = (value: boolean) => {
        setInternalOpen(value);
        onOpenChange?.(value);
    };

    const [formData, setFormData] = useState({
        name: warehouse?.name || "",
        code: warehouse?.code || "",
        description: warehouse?.description || "",
        address: warehouse?.address || "",
    });

    // Sync form data when warehouse changes or dialog opens
    useEffect(() => {
        if (warehouse && open) {
            setFormData({
                name: warehouse.name || "",
                code: warehouse.code || "",
                description: warehouse.description || "",
                address: warehouse.address || "",
            });
        }
    }, [warehouse, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        startTransition(async () => {
            try {
                if (warehouse) {
                    await updateWarehouse(warehouse.id, formData);
                    toast.success("Warehouse updated successfully");
                } else {
                    await createWarehouse(formData);
                    toast.success("Warehouse created successfully");
                }
                setOpen(false);
                router.refresh();
            } catch (error: any) {
                toast.error(error.message || "An error occurred");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>{warehouse ? "Edit" : "Add Warehouse"}</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{warehouse ? "Edit Warehouse" : "Add New Warehouse"}</DialogTitle>
                        <DialogDescription>
                            {warehouse
                                ? "Update warehouse information"
                                : "Create a new warehouse location for inventory storage"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Main Warehouse"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="code">Code *</Label>
                            <Input
                                id="code"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                placeholder="e.g., WH-01"
                                required
                                maxLength={20}
                            />
                            <p className="text-xs text-muted-foreground">
                                Short unique identifier (e.g., WH-01, DEP-A)
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="e.g., 123 Main St, City"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Optional description..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Saving..." : warehouse ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
