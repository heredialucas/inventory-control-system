import { getCurrentUser, hasPermission } from "@/lib/auth";
import { getExpediente } from "@/app/actions/expedientes";
import { UnauthorizedAccess } from "@/components/unauthorized-access";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, ExternalLink, FileText, ShoppingCart, Truck, Repeat, Activity } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

const getPurchaseOrderStatusLabel = (status: string) => {
    switch (status) {
        case "RECEIVED":
            return "Confirmada";
        case "CANCELLED":
            return "Cancelada";
        default:
            return status;
    }
};

const getDeliveryStatusLabel = (status: string) => {
    switch (status) {
        case "DRAFT":
            return "En Camino";
        case "DELIVERED":
            return "Entregado";
        case "CANCELLED":
            return "Cancelado";
        default:
            return status;
    }
};

export default async function ExpedienteDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "expedientes.view")) {
        return <UnauthorizedAccess action="ver" resource="expedientes" />;
    }

    const expediente = await getExpediente(id);
    if (!expediente) notFound();

    const canManage = hasPermission(user, "expedientes.manage");

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                    <Link href="/dashboard/expedientes" className="self-start sm:self-center mt-1 sm:mt-0">
                        <Button variant="ghost" size="icon" className="shrink-0">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
                                Expediente {expediente.number}
                            </h1>
                            <Badge
                                variant={
                                    expediente.status === "ABIERTO"
                                        ? "default"
                                        : expediente.status === "CERRADO"
                                            ? "secondary"
                                            : "destructive"
                                }
                                className="shrink-0"
                            >
                                {expediente.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            {format(new Date(expediente.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                        </p>
                    </div>
                </div>
                {canManage && (
                    <Link href={`/dashboard/expedientes/${expediente.id}/edit`}>
                        <Button variant="outline" className="w-full sm:w-auto">
                            <Edit className="mr-2 h-4 w-4" />
                            <span className="sm:hidden">Editar</span>
                            <span className="hidden sm:inline">Editar Expediente</span>
                        </Button>
                    </Link>
                )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Información General</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <p className="text-muted-foreground">Año</p>
                                <p>{expediente.year || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Tipo</p>
                                <Badge variant="outline" className="mt-1">{expediente.type || "N/A"}</Badge>
                            </div>
                        </div>
                        <div>
                                <p className="text-muted-foreground">Categoría</p>
                                <p>{expediente.category?.name || "Sin categoría"}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Origen / Área</p>
                                <p>{expediente.origin || "No especificado"}</p>
                            </div>
                        <div>
                            <p className="text-muted-foreground">Descripción</p>
                            <p className="whitespace-pre-wrap">{expediente.description || "Sin descripción"}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Resumen de Operaciones</CardTitle>
                        <CardDescription>Haz clic en un ítem para ver el detalle abajo</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <Link href="#purchases" className="flex justify-between items-center py-2 px-3 rounded-md hover:bg-muted transition-colors group">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="text-sm font-medium">Órdenes de Compra</span>
                            </div>
                            <span className="font-bold">{expediente.purchases.length}</span>
                        </Link>
                        <Link href="#receipts" className="flex justify-between items-center py-2 px-3 rounded-md hover:bg-muted transition-colors group">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="text-sm font-medium">Remitos de Recepción</span>
                            </div>
                            <span className="font-bold">{expediente.receipts.length}</span>
                        </Link>
                        <Link href="#deliveries" className="flex justify-between items-center py-2 px-3 rounded-md hover:bg-muted transition-colors group">
                            <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="text-sm font-medium">Entregas</span>
                            </div>
                            <span className="font-bold">{expediente.deliveries.length}</span>
                        </Link>
                        <Link href="#transfers" className="flex justify-between items-center py-2 px-3 rounded-md hover:bg-muted transition-colors group">
                            <div className="flex items-center gap-2">
                                <Repeat className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="text-sm font-medium">Transferencias</span>
                            </div>
                            <span className="font-bold">{expediente.transfers.length}</span>
                        </Link>
                        <Link href="#movements" className="flex justify-between items-center py-2 px-3 rounded-md hover:bg-muted transition-colors group">
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="text-sm font-medium">Movimientos de Stock</span>
                            </div>
                            <span className="font-bold">{expediente.movements.length}</span>
                        </Link>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Trazabilidad Completa</CardTitle>
                    <CardDescription>Detalle cronológico de todas las operaciones vinculadas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-12">
                    {/* Purchases Section */}
                    <div id="purchases" className="scroll-mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-primary" />
                                Órdenes de Compra
                                <Badge variant="secondary">{expediente.purchases.length}</Badge>
                            </h3>
                        </div>
                        {expediente.purchases.length > 0 ? (
                            <>
                                <div className="hidden md:block rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Número</TableHead>
                                                <TableHead>Proveedor</TableHead>
                                                <TableHead>Fecha</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {expediente.purchases.map((purchase) => (
                                                <TableRow key={purchase.id}>
                                                    <TableCell className="font-medium">{purchase.orderNumber}</TableCell>
                                                    <TableCell>{purchase.supplier?.name || "N/A"}</TableCell>
                                                    <TableCell>{format(new Date(purchase.createdAt), "dd/MM/yyyy", { locale: es })}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{getPurchaseOrderStatusLabel(purchase.status)}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Link href={`/dashboard/purchases/${purchase.id}`}>
                                                            <Button variant="ghost" size="sm">
                                                                Ver detalle <ExternalLink className="ml-2 h-3 w-3" />
                                                            </Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="md:hidden space-y-3">
                                    {expediente.purchases.map((purchase) => (
                                        <Card key={purchase.id}>
                                            <CardContent className="p-4 space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <span className="font-medium">{purchase.orderNumber}</span>
                                                    <Badge variant="outline" className="shrink-0">{getPurchaseOrderStatusLabel(purchase.status)}</Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    <p>Proveedor: {purchase.supplier?.name || "N/A"}</p>
                                                    <p>Fecha: {format(new Date(purchase.createdAt), "dd/MM/yyyy", { locale: es })}</p>
                                                </div>
                                                <Link href={`/dashboard/purchases/${purchase.id}`}>
                                                    <Button variant="ghost" size="sm" className="w-full mt-2">
                                                        Ver detalle <ExternalLink className="ml-2 h-3 w-3" />
                                                    </Button>
                                                </Link>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No hay órdenes de compra vinculadas.</p>
                        )}
                    </div>

                    <Separator />

                    {/* Receipts Section */}
                    <div id="receipts" className="scroll-mt-6 space-y-4">
                        {(() => {
                            const groups: Record<string, any> = {};
                            for (const r of expediente.receipts) {
                                const key = r.receiptNumber;
                                if (!groups[key]) {
                                    groups[key] = {
                                        receiptNumber: key,
                                        receipts: [],
                                        totalAmount: 0,
                                        count: 0,
                                        allCompleted: true,
                                        latestDate: r.date || r.createdAt,
                                        firstReceipt: r,
                                    };
                                }
                                groups[key].receipts.push(r);
                                groups[key].count++;
                                groups[key].totalAmount += Number(r.totalAmount);
                                if (r.status !== "COMPLETED") groups[key].allCompleted = false;
                                if (new Date(r.date || r.createdAt) > new Date(groups[key].latestDate))
                                    groups[key].latestDate = r.date || r.createdAt;
                            }

                            const sortedGroups = Object.values(groups).sort(
                                (a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime()
                            );

                            return (
                                <>
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-primary" />
                                            Remitos de Recepción
                                            <Badge variant="secondary">{sortedGroups.length}</Badge>
                                        </h3>
                                    </div>
                                    {sortedGroups.length > 0 ? (
                                        <>
                                            <div className="hidden md:block rounded-md border">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Número</TableHead>
                                                            <TableHead>Ingresos</TableHead>
                                                            <TableHead>OC Relacionada</TableHead>
                                                            <TableHead>Tipo</TableHead>
                                                            <TableHead>Monto Total</TableHead>
                                                            <TableHead>Estado</TableHead>
                                                            <TableHead>Fecha</TableHead>
                                                            <TableHead className="text-right">Acciones</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {sortedGroups.map((group) => {
                                                            const first = group.firstReceipt;
                                                            return (
                                                                <TableRow key={group.receiptNumber}>
                                                                    <TableCell className="font-medium">{group.receiptNumber}</TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="secondary">{group.count} ingreso{group.count !== 1 ? "s" : ""}</Badge>
                                                                    </TableCell>
                                                                    <TableCell>{first.purchaseOrder?.orderNumber || "Directo"}</TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="secondary">
                                                                            {first.type === "PURCHASE" ? "COMPRA" : 
                                                                             first.type === "REINGRESO" ? "REINGRESO" : first.type}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(group.totalAmount)}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge variant={group.allCompleted ? "default" : "outline"}>
                                                                            {group.allCompleted ? "Completado" : "En Proceso"}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell>{format(new Date(group.latestDate), "dd/MM/yyyy", { locale: es })}</TableCell>
                                                                    <TableCell className="text-right">
                                                                        <Link href={`/dashboard/receipts/${first.id}`}>
                                                                            <Button variant="ghost" size="sm">
                                                                                Ver detalle <ExternalLink className="ml-2 h-3 w-3" />
                                                                            </Button>
                                                                        </Link>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                            <div className="md:hidden space-y-3">
                                                {sortedGroups.map((group) => {
                                                    const first = group.firstReceipt;
                                                    return (
                                                        <Card key={group.receiptNumber}>
                                                            <CardContent className="p-4 space-y-2">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <span className="font-medium">{group.receiptNumber}</span>
                                                                        <Badge variant="secondary" className="ml-2">
                                                                            {group.count} ingreso{group.count !== 1 ? "s" : ""}
                                                                        </Badge>
                                                                    </div>
                                                                    <Badge variant={group.allCompleted ? "default" : "outline"} className="shrink-0">
                                                                        {group.allCompleted ? "Completado" : "En Proceso"}
                                                                    </Badge>
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    <p>OC: {first.purchaseOrder?.orderNumber || "Directo"}</p>
                                                                    <p>Monto: {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(group.totalAmount)}</p>
                                                                    <p>Fecha: {format(new Date(group.latestDate), "dd/MM/yyyy", { locale: es })}</p>
                                                                </div>
                                                                <Link href={`/dashboard/receipts/${first.id}`}>
                                                                    <Button variant="ghost" size="sm" className="w-full mt-2">
                                                                        Ver detalle <ExternalLink className="ml-2 h-3 w-3" />
                                                                    </Button>
                                                                </Link>
                                                            </CardContent>
                                                        </Card>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">No hay remitos de recepción vinculados.</p>
                                    )}
                                </>
                            );
                        })()}
                    </div>

                    <Separator />

                    {/* Deliveries Section */}
                    <div id="deliveries" className="scroll-mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Truck className="h-5 w-5 text-primary" />
                                Entregas
                                <Badge variant="secondary">{expediente.deliveries.length}</Badge>
                            </h3>
                        </div>
                        {expediente.deliveries.length > 0 ? (
                            <>
                                <div className="hidden md:block rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Número</TableHead>
                                                <TableHead>Institución</TableHead>
                                                <TableHead>Fecha</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {expediente.deliveries.map((delivery) => (
                                                <TableRow key={delivery.id}>
                                                    <TableCell className="font-medium">{delivery.deliveryNumber}</TableCell>
                                                    <TableCell>{delivery.institution?.name || "N/A"}</TableCell>
                                                    <TableCell>{delivery.deliveryDate ? format(new Date(delivery.deliveryDate), "dd/MM/yyyy", { locale: es }) : format(new Date(delivery.createdAt), "dd/MM/yyyy", { locale: es })}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{getDeliveryStatusLabel(delivery.status)}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Link href={`/dashboard/deliveries/${delivery.id}`}>
                                                            <Button variant="ghost" size="sm">
                                                                Ver detalle <ExternalLink className="ml-2 h-3 w-3" />
                                                            </Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="md:hidden space-y-3">
                                    {expediente.deliveries.map((delivery) => (
                                        <Card key={delivery.id}>
                                            <CardContent className="p-4 space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <span className="font-medium">{delivery.deliveryNumber}</span>
                                                    <Badge variant="outline" className="shrink-0">{getDeliveryStatusLabel(delivery.status)}</Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    <p>Institución: {delivery.institution?.name || "N/A"}</p>
                                                    <p>Fecha: {delivery.deliveryDate ? format(new Date(delivery.deliveryDate), "dd/MM/yyyy", { locale: es }) : format(new Date(delivery.createdAt), "dd/MM/yyyy", { locale: es })}</p>
                                                </div>
                                                <Link href={`/dashboard/deliveries/${delivery.id}`}>
                                                    <Button variant="ghost" size="sm" className="w-full mt-2">
                                                        Ver detalle <ExternalLink className="ml-2 h-3 w-3" />
                                                    </Button>
                                                </Link>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No hay entregas vinculadas.</p>
                        )}
                    </div>

                    <Separator />

                    {/* Transfers Section */}
                    <div id="transfers" className="scroll-mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Repeat className="h-5 w-5 text-primary" />
                                Transferencias
                                <Badge variant="secondary">{expediente.transfers.length}</Badge>
                            </h3>
                        </div>
                        {expediente.transfers.length > 0 ? (
                            <>
                                <div className="hidden md:block rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Producto</TableHead>
                                                <TableHead>Desde</TableHead>
                                                <TableHead>Hasta</TableHead>
                                                <TableHead>Cantidad</TableHead>
                                                <TableHead>Fecha</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {expediente.transfers.map((transfer) => (
                                                <TableRow key={transfer.id}>
                                                    <TableCell className="font-medium">{transfer.product?.name || "N/A"}</TableCell>
                                                    <TableCell>{transfer.fromWarehouse?.name || "N/A"}</TableCell>
                                                    <TableCell>{transfer.toWarehouse?.name || "N/A"}</TableCell>
                                                    <TableCell>{transfer.quantity}</TableCell>
                                                    <TableCell>{format(new Date(transfer.createdAt), "dd/MM/yyyy", { locale: es })}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="md:hidden space-y-3">
                                    {expediente.transfers.map((transfer) => (
                                        <Card key={transfer.id}>
                                            <CardContent className="p-4 space-y-2">
                                                <p className="font-medium">{transfer.product?.name || "N/A"}</p>
                                                <div className="text-sm text-muted-foreground">
                                                    <p>Desde: {transfer.fromWarehouse?.name || "N/A"}</p>
                                                    <p>Hasta: {transfer.toWarehouse?.name || "N/A"}</p>
                                                    <p>Cantidad: {transfer.quantity}</p>
                                                    <p>Fecha: {format(new Date(transfer.createdAt), "dd/MM/yyyy", { locale: es })}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No hay transferencias vinculadas.</p>
                        )}
                    </div>

                    <Separator />

                    {/* Movements Section */}
                    <div id="movements" className="scroll-mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                Movimientos de Stock
                            </h3>
                        </div>
                        {(() => {
                            // 1. Datos de Remitos (Estado Actual)
                            const receiptItems = expediente.receipts.flatMap(r => 
                                r.items.map(item => ({
                                    id: `receipt-${r.id}-${item.id}`,
                                    product: item.product,
                                    warehouse: r.warehouse || r.purchaseOrder?.warehouse || null,
                                    type: "IN",
                                    quantity: item.quantity,
                                    reason: `Remito #${r.receiptNumber}` as string,
                                    createdAt: r.createdAt,
                                }))
                            );

                            // 2. Otros movimientos (Ajustes manuales, etc) - pero incluir ajustes de receipts (ediciones de remitos)
                            const otherMovements = expediente.movements
                                .filter(m => m.sourceType !== "RECEIPT" || m.type === "ADJUSTMENT")
                                .map(m => ({
                                    id: m.id,
                                    product: m.product,
                                    warehouse: m.warehouse,
                                    type: m.type,
                                    quantity: m.quantity,
                                    reason: m.reason || "",
                                    createdAt: m.createdAt,
                                }));

                            const displayMovements = [...receiptItems, ...otherMovements].sort((a, b) => 
                                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                            );

                            if (displayMovements.length === 0) {
                                return <p className="text-sm text-muted-foreground italic">No hay movimientos de stock vinculados.</p>;
                            }

                            return (
                                <>
                                    <div className="hidden md:block rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Producto</TableHead>
                                                    <TableHead>Depósito</TableHead>
                                                    <TableHead>Tipo</TableHead>
                                                    <TableHead>Cantidad</TableHead>
                                                    <TableHead>Motivo</TableHead>
                                                    <TableHead>Fecha</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {displayMovements.map((movement) => {
                                                    const isEntry = movement.type === "IN" || (movement.type === "ADJUSTMENT" && movement.quantity > 0);
                                                    return (
                                                        <TableRow key={movement.id}>
                                                            <TableCell className="font-medium">{movement.product?.name || "N/A"}</TableCell>
                                                            <TableCell>{movement.warehouse?.name || "Sin asignar"}</TableCell>
                                                            <TableCell>
                                                                <Badge variant={isEntry ? "default" : "destructive"}>
                                                                    {isEntry ? "ENTRADA" : "SALIDA"}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>{Math.abs(movement.quantity)}</TableCell>
                                                            <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate" title={movement.reason}>
                                                                {movement.reason || "Sin especificar"}
                                                            </TableCell>
                                                            <TableCell>{format(new Date(movement.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    <div className="md:hidden space-y-3">
                                        {displayMovements.map((movement) => {
                                            const isEntry = movement.type === "IN" || (movement.type === "ADJUSTMENT" && movement.quantity > 0);
                                            return (
                                                <Card key={movement.id}>
                                                    <CardContent className="p-4 space-y-2">
                                                        <div className="flex justify-between items-start">
                                                            <p className="font-medium">{movement.product?.name || "N/A"}</p>
                                                            <Badge variant={isEntry ? "default" : "destructive"} className="shrink-0">
                                                                {isEntry ? "ENTRADA" : "SALIDA"}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            <p>Depósito: {movement.warehouse?.name || "Sin asignar"}</p>
                                                            <p>Cantidad: {Math.abs(movement.quantity)}</p>
                                                            <p>Motivo: {movement.reason || "Sin especificar"}</p>
                                                            <p>Fecha: {format(new Date(movement.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}</p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
