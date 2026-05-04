"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, PackageCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { confirmDelivery, markAsDelivered, cancelDelivery } from "@/app/actions/deliveries";

interface DeliveryActionsProps {
    deliveryId: string;
    status: string;
    userId: string;
    variant?: "icon" | "button";
}

export function DeliveryActions({ deliveryId, status, userId, variant = "icon" }: DeliveryActionsProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleConfirm = () => {
        startTransition(async () => {
            try {
                await confirmDelivery(deliveryId);
                toast.success("Entrega confirmada");
                router.refresh();
            } catch (error: any) {
                toast.error(error.message || "Error al confirmar entrega");
            }
        });
    };

    const handleDeliver = () => {
        startTransition(async () => {
            try {
                await markAsDelivered(deliveryId, userId);
                toast.success("Entrega marcada como entregada");
                router.refresh();
            } catch (error: any) {
                toast.error(error.message || "Error al marcar entrega");
            }
        });
    };

    const handleCancel = () => {
        if (!confirm("¿Estás seguro de que quieres cancelar esta entrega?")) {
            return;
        }
        startTransition(async () => {
            try {
                await cancelDelivery(deliveryId);
                toast.success("Entrega cancelada");
                router.refresh();
            } catch (error: any) {
                toast.error(error.message || "Error al cancelar entrega");
            }
        });
    };

    if (variant === "button") {
        return (
            <div className="flex flex-wrap gap-2">
                {status === "DRAFT" && (
                    <Button
                        onClick={handleConfirm}
                        disabled={isPending}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Confirmar Entrega
                    </Button>
                )}
                {status === "CONFIRMED" && (
                    <Button
                        onClick={handleDeliver}
                        disabled={isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <PackageCheck className="mr-2 h-4 w-4" />
                        Confirmar como Entregado
                    </Button>
                )}
                {status !== "DELIVERED" && status !== "CANCELLED" && (
                    <Button
                        variant="destructive"
                        onClick={handleCancel}
                        disabled={isPending}
                    >
                        <XCircle className="mr-2 h-4 w-4" />
                        Eliminar
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1">
            {status === "DRAFT" && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleConfirm}
                    disabled={isPending}
                    title="Confirmar entrega"
                >
                    <CheckCircle className="h-4 w-4 text-green-600" />
                </Button>
            )}
            {status === "CONFIRMED" && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeliver}
                    disabled={isPending}
                    title="Confirmar como entregado"
                >
                    <PackageCheck className="h-4 w-4 text-blue-600" />
                </Button>
            )}
            {status !== "DELIVERED" && status !== "CANCELLED" && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isPending}
                    title="Cancelar entrega"
                >
                    <XCircle className="h-4 w-4 text-destructive" />
                </Button>
            )}
        </div>
    );
}