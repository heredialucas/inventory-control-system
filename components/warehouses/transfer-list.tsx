"use client";

import { useTransition } from "react";
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
import { MoreHorizontal, ArrowRight, Check, Truck, X } from "lucide-react";
import { toast } from "sonner";
import { completeTransfer, cancelTransfer, markTransferInTransit } from "@/app/actions/warehouses";
import { TransferStatus } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";

type TransferWithRelations = {
    id: string;
    quantity: number;
    status: TransferStatus;
    notes: string | null;
    createdAt: Date;
    completedAt: Date | null;
    fromWarehouse: {
        id: string;
        name: string;
        code: string;
    };
    toWarehouse: {
        id: string;
        name: string;
        code: string;
    };
    product: {
        id: string;
        name: string;
        sku: string;
    };
    user: {
        id: string;
        email: string;
        username: string | null;
    };
};

interface TransferListProps {
    transfers: TransferWithRelations[];
    userId: string;
}

const statusColors: Record<TransferStatus, "default" | "secondary" | "destructive" | "outline"> = {
    PENDING: "secondary",
    IN_TRANSIT: "default",
    COMPLETED: "outline",
    CANCELLED: "destructive",
};

const statusIcons: Record<TransferStatus, React.ReactNode> = {
    PENDING: null,
    IN_TRANSIT: <Truck className="h-3 w-3 mr-1" />,
    COMPLETED: <Check className="h-3 w-3 mr-1" />,
    CANCELLED: <X className="h-3 w-3 mr-1" />,
};

export function TransferList({ transfers, userId }: TransferListProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleMarkInTransit = (id: string) => {
        startTransition(async () => {
            try {
                await markTransferInTransit(id);
                toast.success("Transfer marked as in transit");
                router.refresh();
            } catch (error: any) {
                toast.error(error.message || "Failed to update transfer");
            }
        });
    };

    const handleComplete = (id: string) => {
        if (!confirm("Mark this transfer as completed?")) return;

        startTransition(async () => {
            try {
                await completeTransfer(id, userId);
                toast.success("Transfer completed successfully");
                router.refresh();
            } catch (error: any) {
                toast.error(error.message || "Failed to complete transfer");
            }
        });
    };

    const handleCancel = (id: string) => {
        if (!confirm("Cancel this transfer? Stock will be returned to the source warehouse.")) return;

        startTransition(async () => {
            try {
                await cancelTransfer(id, userId);
                toast.success("Transfer cancelled");
                router.refresh();
            } catch (error: any) {
                toast.error(error.message || "Failed to cancel transfer");
            }
        });
    };

    if (transfers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <ArrowRight className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No transfers found</h3>
                <p className="text-sm text-muted-foreground">
                    Create a transfer to move stock between warehouses
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>From → To</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transfers.map((transfer) => (
                        <TableRow key={transfer.id}>
                            <TableCell>
                                <div>
                                    <div className="font-medium">{transfer.product.name}</div>
                                    <div className="text-sm text-muted-foreground font-mono">{transfer.product.sku}</div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm">{transfer.fromWarehouse.code}</span>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-mono text-sm">{transfer.toWarehouse.code}</span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {transfer.fromWarehouse.name} → {transfer.toWarehouse.name}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary">{transfer.quantity}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant={statusColors[transfer.status]} className="flex items-center w-fit">
                                    {statusIcons[transfer.status]}
                                    {transfer.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(transfer.createdAt), { addSuffix: true })}
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
                                        {transfer.status === "PENDING" && (
                                            <>
                                                <DropdownMenuItem onClick={() => handleMarkInTransit(transfer.id)}>
                                                    <Truck className="mr-2 h-4 w-4" />
                                                    Mark In Transit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleComplete(transfer.id)}>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Complete Transfer
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => handleCancel(transfer.id)}
                                                >
                                                    <X className="mr-2 h-4 w-4" />
                                                    Cancel
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        {transfer.status === "IN_TRANSIT" && (
                                            <>
                                                <DropdownMenuItem onClick={() => handleComplete(transfer.id)}>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Complete Transfer
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => handleCancel(transfer.id)}
                                                >
                                                    <X className="mr-2 h-4 w-4" />
                                                    Cancel
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        {(transfer.status === "COMPLETED" || transfer.status === "CANCELLED") && (
                                            <DropdownMenuItem disabled>No actions available</DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
