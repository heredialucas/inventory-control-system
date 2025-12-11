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
import { Card, CardContent } from "@/components/ui/card";
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
import { es } from "date-fns/locale";

type TransferWithRelations = {
    id: string;
    type?: "TRANSFER" | "MOVEMENT";
    quantity: number;
    status: TransferStatus | string;
    notes: string | null;
    createdAt: Date | string;
    completedAt: Date | string | null;
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
    canManage?: boolean;
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    PENDING: "secondary",
    IN_TRANSIT: "default",
    COMPLETED: "outline",
    CANCELLED: "destructive",
};

const statusIcons: Record<string, React.ReactNode> = {
    PENDING: null,
    IN_TRANSIT: <Truck className="h-3 w-3 mr-1" />,
    COMPLETED: <Check className="h-3 w-3 mr-1" />,
    CANCELLED: <X className="h-3 w-3 mr-1" />,
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case "PENDING":
            return "Pendiente";
        case "IN_TRANSIT":
            return "En Tránsito";
        case "COMPLETED":
            return "Completada";
        case "CANCELLED":
            return "Cancelada";
        default:
            return status;
    }
};

export function TransferList({ transfers, userId, canManage = false }: TransferListProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleMarkInTransit = (id: string) => {
        startTransition(async () => {
            try {
                await markTransferInTransit(id);
                toast.success("Transferencia marcada como en tránsito");
                router.refresh();
            } catch (error: any) {
                toast.error(error.message || "Error al actualizar transferencia");
            }
        });
    };

    const handleComplete = (id: string) => {
        if (!confirm("¿Marcar esta transferencia como completada?")) return;

        startTransition(async () => {
            try {
                await completeTransfer(id, userId);
                toast.success("Transferencia completada exitosamente");
                router.refresh();
            } catch (error: any) {
                toast.error(error.message || "Error al completar transferencia");
            }
        });
    };

    const handleCancel = (id: string) => {
        if (!confirm("¿Cancelar esta transferencia? El stock será devuelto al depósito origen.")) return;

        startTransition(async () => {
            try {
                await cancelTransfer(id, userId);
                toast.success("Transferencia cancelada");
                router.refresh();
            } catch (error: any) {
                toast.error(error.message || "Error al cancelar transferencia");
            }
        });
    };

    if (transfers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <ArrowRight className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron transferencias</h3>
                <p className="text-sm text-muted-foreground">
                    Crea una transferencia para mover stock entre depósitos
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Vista de tabla para desktop */}
            <div className="hidden md:block rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Origen → Destino</TableHead>
                            <TableHead>Cantidad</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Creado</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transfers.map((transfer) => {
                            const isIngreso = transfer.type === "MOVEMENT" || transfer.fromWarehouse.id === "unassigned";

                            return (
                                <TableRow key={transfer.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{transfer.product.name}</div>
                                            <div className="text-sm text-muted-foreground font-mono">{transfer.product.sku}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {isIngreso ? (
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 text-primary">
                                                    <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary">
                                                        ✨ Ingreso
                                                    </Badge>
                                                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                    <span className="font-mono text-sm font-medium">{transfer.toWarehouse.code}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Destino: {transfer.toWarehouse.name}
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-sm">{transfer.fromWarehouse.code}</span>
                                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-mono text-sm">{transfer.toWarehouse.code}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {transfer.fromWarehouse.name} → {transfer.toWarehouse.name}
                                                </div>
                                            </>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{transfer.quantity}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={statusColors[transfer.status as string] || "default"} className="flex items-center w-fit">
                                            {statusIcons[transfer.status as string]}
                                            {getStatusLabel(transfer.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatDistanceToNow(new Date(transfer.createdAt), { addSuffix: true, locale: es })}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" disabled={isPending}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Acciones</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {isIngreso ? (
                                                    <DropdownMenuItem disabled>
                                                        <Check className="mr-2 h-4 w-4" />
                                                        Ingreso Completado
                                                    </DropdownMenuItem>
                                                ) : canManage ? (
                                                    <>
                                                        {transfer.status === "PENDING" && (
                                                            <>
                                                                <DropdownMenuItem onClick={() => handleMarkInTransit(transfer.id)}>
                                                                    <Truck className="mr-2 h-4 w-4" />
                                                                    Marcar En Tránsito
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleComplete(transfer.id)}>
                                                                    <Check className="mr-2 h-4 w-4" />
                                                                    Completar Transferencia
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-destructive"
                                                                    onClick={() => handleCancel(transfer.id)}
                                                                >
                                                                    <X className="mr-2 h-4 w-4" />
                                                                    Cancelar
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        {transfer.status === "IN_TRANSIT" && (
                                                            <>
                                                                <DropdownMenuItem onClick={() => handleComplete(transfer.id)}>
                                                                    <Check className="mr-2 h-4 w-4" />
                                                                    Completar Transferencia
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-destructive"
                                                                    onClick={() => handleCancel(transfer.id)}
                                                                >
                                                                    <X className="mr-2 h-4 w-4" />
                                                                    Cancelar
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        {(transfer.status === "COMPLETED" || transfer.status === "CANCELLED") && (
                                                            <DropdownMenuItem disabled>No hay acciones disponibles</DropdownMenuItem>
                                                        )}
                                                    </>
                                                ) : (
                                                    <DropdownMenuItem disabled>Solo lectura</DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Vista de cards para móviles */}
            <div className="md:hidden space-y-4">
                {transfers.map((transfer) => {
                    const isIngreso = transfer.type === "MOVEMENT" || transfer.fromWarehouse.id === "unassigned";

                    return (
                        <Card key={transfer.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h4 className="font-medium">{transfer.product.name}</h4>
                                        <p className="text-sm text-muted-foreground font-mono">
                                            Código: {transfer.product.sku}
                                        </p>
                                    </div>
                                    <Badge variant={statusColors[transfer.status as string] || "default"} className="flex items-center ml-2">
                                        {statusIcons[transfer.status as string]}
                                        {getStatusLabel(transfer.status)}
                                    </Badge>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        {isIngreso ? (
                                            <div className="flex items-center gap-2 text-primary">
                                                <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary">
                                                    ✨ Ingreso
                                                </Badge>
                                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                <span className="font-mono text-sm font-medium">{transfer.toWarehouse.code}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm">{transfer.fromWarehouse.code}</span>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-mono text-sm">{transfer.toWarehouse.code}</span>
                                            </div>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {isIngreso
                                                ? `Destino: ${transfer.toWarehouse.name}`
                                                : `${transfer.fromWarehouse.name} → ${transfer.toWarehouse.name}`
                                            }
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Cantidad</p>
                                            <Badge variant="secondary" className="mt-1">{transfer.quantity}</Badge>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Creado</p>
                                            <p className="text-xs mt-1">
                                                {formatDistanceToNow(new Date(transfer.createdAt), { addSuffix: true, locale: es })}
                                            </p>
                                        </div>
                                    </div>

                                    {transfer.notes && (
                                        <div>
                                            <p className="text-muted-foreground text-sm">Notas</p>
                                            <p className="text-sm mt-1">{transfer.notes}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end mt-4 pt-3 border-t">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" disabled={isPending}>
                                                <MoreHorizontal className="h-4 w-4 mr-1" />
                                                Acciones
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {isIngreso ? (
                                                <DropdownMenuItem disabled>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Ingreso Completado
                                                </DropdownMenuItem>
                                            ) : canManage ? (
                                                <>
                                                    {transfer.status === "PENDING" && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => handleMarkInTransit(transfer.id)}>
                                                                <Truck className="mr-2 h-4 w-4" />
                                                                Marcar En Tránsito
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleComplete(transfer.id)}>
                                                                <Check className="mr-2 h-4 w-4" />
                                                                Completar Transferencia
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive"
                                                                onClick={() => handleCancel(transfer.id)}
                                                            >
                                                                <X className="mr-2 h-4 w-4" />
                                                                Cancelar
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    {transfer.status === "IN_TRANSIT" && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => handleComplete(transfer.id)}>
                                                                <Check className="mr-2 h-4 w-4" />
                                                                Completar Transferencia
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive"
                                                                onClick={() => handleCancel(transfer.id)}
                                                            >
                                                                <X className="mr-2 h-4 w-4" />
                                                                Cancelar
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    {(transfer.status === "COMPLETED" || transfer.status === "CANCELLED") && (
                                                        <DropdownMenuItem disabled>No hay acciones disponibles</DropdownMenuItem>
                                                    )}
                                                </>
                                            ) : (
                                                <DropdownMenuItem disabled>Solo lectura</DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </>
    );
}
