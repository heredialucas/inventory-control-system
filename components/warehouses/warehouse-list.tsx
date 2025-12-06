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
import { MoreHorizontal, Eye, Edit, Power, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { toggleWarehouseStatus, deleteWarehouse } from "@/app/actions/warehouses";
import { WarehouseForm } from "./warehouse-form";

type WarehouseWithCounts = {
    id: string;
    name: string;
    code: string;
    description: string | null;
    address: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: {
        stockItems: number;
        transfersFrom: number;
        transfersTo: number;
    };
};

interface WarehouseListProps {
    warehouses: WarehouseWithCounts[];
}

export function WarehouseList({ warehouses }: WarehouseListProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [editingWarehouse, setEditingWarehouse] = useState<WarehouseWithCounts | null>(null);

    const handleToggleStatus = (id: string) => {
        startTransition(async () => {
            try {
                await toggleWarehouseStatus(id);
                toast.success("Warehouse status updated");
                router.refresh();
            } catch (error: any) {
                toast.error(error.message || "Failed to update status");
            }
        });
    };

    const handleDelete = (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete warehouse "${name}"?`)) {
            return;
        }

        startTransition(async () => {
            try {
                await deleteWarehouse(id);
                toast.success("Warehouse deleted successfully");
                router.refresh();
            } catch (error: any) {
                toast.error(error.message || "Failed to delete warehouse");
            }
        });
    };

    if (warehouses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No warehouses found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Get started by creating your first warehouse
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
                            <TableHead>Address</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {warehouses.map((warehouse) => (
                            <TableRow key={warehouse.id}>
                                <TableCell className="font-mono font-semibold">{warehouse.code}</TableCell>
                                <TableCell>
                                    <div>
                                        <div className="font-medium">{warehouse.name}</div>
                                        {warehouse.description && (
                                            <div className="text-sm text-muted-foreground line-clamp-1">
                                                {warehouse.description}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {warehouse.address || "-"}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{warehouse._count.stockItems}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={warehouse.isActive ? "default" : "secondary"}>
                                        {warehouse.isActive ? "Active" : "Inactive"}
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
                                                <Link href={`/dashboard/warehouses/${warehouse.id}`}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setEditingWarehouse(warehouse)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggleStatus(warehouse.id)}>
                                                <Power className="mr-2 h-4 w-4" />
                                                {warehouse.isActive ? "Deactivate" : "Activate"}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onClick={() => handleDelete(warehouse.id, warehouse.name)}
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

            {editingWarehouse && (
                <WarehouseForm
                    warehouse={editingWarehouse}
                    trigger={<div />}
                />
            )}
        </>
    );
}
