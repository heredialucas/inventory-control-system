import { notFound } from "next/navigation";
import { getSupplier } from "@/app/actions/suppliers";
import { getPurchaseOrders } from "@/app/actions/purchases";
import { SupplierForm } from "@/components/suppliers/supplier-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Mail, Phone, MapPin, User } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const getPurchaseOrderStatusLabel = (status: string) => {
    switch (status) {
        case "DRAFT":
            return "Borrador";
        case "PENDING":
            return "Pendiente";
        case "RECEIVED":
            return "Recibida";
        case "PARTIAL":
            return "Parcial";
        case "CANCELLED":
            return "Cancelada";
        default:
            return status;
    }
};

export default async function SupplierDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supplier = await getSupplier(id);

    if (!supplier) {
        notFound();
    }

    const purchaseOrders = await getPurchaseOrders({ supplierId: id });

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Link href="/dashboard/suppliers">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl truncate">{supplier.name}</h1>
                            <Badge variant={supplier.isActive ? "default" : "secondary"}>
                                {supplier.isActive ? "Activo" : "Inactivo"}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground font-mono text-sm mt-1">
                            {supplier.code}
                        </p>
                    </div>
                </div>
                <div className="flex justify-end">
                    <SupplierForm supplier={supplier} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Información de Contacto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {supplier.contactName && (
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{supplier.contactName}</span>
                            </div>
                        )}
                        {supplier.email && (
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{supplier.email}</span>
                            </div>
                        )}
                        {supplier.phone && (
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{supplier.phone}</span>
                            </div>
                        )}
                        {supplier.address && (
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <span className="text-sm">{supplier.address}</span>
                            </div>
                        )}
                        {supplier.notes && (
                            <div className="pt-2 border-t">
                                <p className="text-sm text-muted-foreground">Notas</p>
                                <p className="text-sm whitespace-pre-wrap">{supplier.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Estadísticas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Total de Pedidos</span>
                            <span className="text-2xl font-bold">{purchaseOrders.length}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Órdenes de Compra</CardTitle>
                </CardHeader>
                <CardContent>
                    {purchaseOrders.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No se encontraron órdenes de compra
                        </p>
                    ) : (
                        <>
                            {/* Vista móvil - Cards */}
                            <div className="md:hidden space-y-4">
                                {purchaseOrders.map((order) => (
                                    <Card key={order.id} className="p-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Link
                                                    href={`/dashboard/purchases/${order.id}`}
                                                    className="font-mono text-sm font-semibold hover:underline"
                                                >
                                                    {order.orderNumber}
                                                </Link>
                                                <Badge variant="outline">{getPurchaseOrderStatusLabel(order.status)}</Badge>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">Depósito</p>
                                                    <p className="font-medium">{order.warehouse.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Artículos</p>
                                                    <Badge variant="secondary" className="mt-1">{order._count.items}</Badge>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Total</p>
                                                    <p className="font-medium">${order.totalAmount.toString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Creado</p>
                                                    <p className="text-xs">
                                                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: es })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            {/* Vista desktop - Tabla */}
                            <div className="hidden md:block">
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Número de Orden</TableHead>
                                                <TableHead>Depósito</TableHead>
                                                <TableHead>Artículos</TableHead>
                                                <TableHead>Total</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead>Creado</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {purchaseOrders.map((order) => (
                                                <TableRow key={order.id}>
                                                    <TableCell className="font-mono">
                                                        <Link
                                                            href={`/dashboard/purchases/${order.id}`}
                                                            className="hover:underline"
                                                        >
                                                            {order.orderNumber}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>{order.warehouse.name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">{order._count.items}</Badge>
                                                    </TableCell>
                                                    <TableCell>${order.totalAmount.toString()}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{getPurchaseOrderStatusLabel(order.status)}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: es })}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
