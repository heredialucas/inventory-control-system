import { notFound, redirect } from "next/navigation";
import { getDelivery, markAsDelivered, cancelDelivery } from "@/app/actions/deliveries";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle2, XCircle, Truck, Building2, Package } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default async function DeliveryDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const delivery = await getDelivery(id);
    const user = await getCurrentUser();

    if (!delivery) {
        notFound();
    }

    if (!user) redirect("/login");

    async function handleMarkDelivered() {
        "use server";
        if (!user) return;
        await markAsDelivered(id, user.id);
        redirect(`/dashboard/deliveries/${id}`);
    }

    async function handleCancel() {
        "use server";
        await cancelDelivery(id);
        redirect(`/dashboard/deliveries/${id}`);
    }

    const isDraft = delivery.status === "DRAFT";
    const isDelivered = delivery.status === "DELIVERED";
    const isCancelled = delivery.status === "CANCELLED";

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/deliveries">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{delivery.deliveryNumber}</h1>
                        <Badge
                            variant={isDelivered ? "default" : isCancelled ? "destructive" : "secondary"}
                            className="text-sm px-2 py-0.5"
                        >
                            {delivery.status === "DELIVERED" ? "Entregado" :
                                delivery.status === "CANCELLED" ? "Cancelado" : "Borrador / Pendiente"}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">
                        Creado el {format(new Date(delivery.createdAt), "PPP")}
                    </p>
                </div>
                <div className="flex gap-2">
                    {isDraft && (
                        <>
                            <form action={handleCancel}>
                                <Button variant="outline" type="submit">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancelar
                                </Button>
                            </form>
                            <form action={handleMarkDelivered}>
                                <Button type="submit">
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Marcar como Entregado
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Ítems de la Entrega</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead className="text-right">Cantidad</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {delivery.items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.product.name}</TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground">{item.product.sku}</TableCell>
                                        <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">Información del Envío</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-sm font-medium mb-1 flex items-center gap-2">
                                    <Building2 className="h-4 w-4" /> Destino (Escuela)
                                </div>
                                <div className="text-lg font-semibold">{delivery.institution.name}</div>
                                <div className="text-sm text-muted-foreground">{delivery.institution.code}</div>
                            </div>
                            <Separator />
                            <div>
                                <div className="text-sm font-medium mb-1 flex items-center gap-2">
                                    <Package className="h-4 w-4" /> Origen (Depósito)
                                </div>
                                <div className="text-base">{delivery.warehouse.name}</div>
                            </div>

                            {delivery.deliveryDate && (
                                <>
                                    <Separator />
                                    <div>
                                        <div className="text-sm font-medium mb-1 flex items-center gap-2">
                                            <Truck className="h-4 w-4" /> Fecha de Entrega
                                        </div>
                                        <div className="text-base">{format(new Date(delivery.deliveryDate), "PPP")}</div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {delivery.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-muted-foreground">Notas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm italic">{delivery.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
