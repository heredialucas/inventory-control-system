"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Power, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { toggleSupplierStatus, deleteSupplier } from "@/app/actions/suppliers";
import { SupplierForm } from "./supplier-form";

type SupplierWithCounts = {
    id: string;
    name: string;
    code: string;
    email: string | null;
    phone: string | null;
    contactName: string | null;
    address: string | null;
    notes: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: {
        purchaseOrders: number;
    };
};

interface SupplierListProps {
    suppliers: SupplierWithCounts[];
}

export function SupplierList({ suppliers }: SupplierListProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [editingSupplier, setEditingSupplier] = useState<SupplierWithCounts | null>(null);

    const handleToggleStatus = (id: string) => {
        startTransition(async () => {
            try {
                await toggleSupplierStatus(id);
                toast.success("Supplier status updated");
                router.refresh();
            } catch (error: any) {
                toast.error(error.message || "Failed to update status");
            }
        });
    };

    const handleDelete = (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete supplier "${name}"?`)) {
            return;
        }

        startTransition(async () => {
            try {
                await deleteSupplier(id);
                toast.success("Supplier deleted successfully");
                router.refresh();
            } catch (error: any) {
                toast.error(error.message || "Failed to delete supplier");
            }
        });
    };

    if (suppliers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No suppliers found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Get started by creating your first supplier
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Orders</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {suppliers.map((supplier) => (
                            <TableRow key={supplier.id}>
                                <TableCell className="font-mono font-semibold">{supplier.code}</TableCell>
                                <TableCell className="font-medium">{supplier.name}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {supplier.contactName || "-"}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {supplier.email || "-"}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{supplier._count.purchaseOrders}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={supplier.isActive ? "default" : "secondary"}>
                                        {supplier.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" disabled={isPending}>
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Actions</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/suppliers/${supplier.id}`}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setEditingSupplier(supplier)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggleStatus(supplier.id)}>
                                                <Power className="mr-2 h-4 w-4" />
                                                {supplier.isActive ? "Deactivate" : "Activate"}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onClick={() => handleDelete(supplier.id, supplier.name)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {editingSupplier && (
                <SupplierForm
                    supplier={editingSupplier}
                    trigger={<div />}
                />
            )}
        </>
    );
}
