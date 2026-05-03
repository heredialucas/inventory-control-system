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

export default async function ExpedienteDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "expedientes.view")) {
        return <UnauthorizedAccess action="ver" resource="expediente" />;
    }

    const expediente = await getExpediente(id);
    if (!expediente) notFound();

    const canManage = hasPermission(user, "expedientes.manage");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/expedientes">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">
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
                            >
                                {expediente.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Creado el {format(new Date(expediente.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                        </p>
                    </div>
                </div>
                {canManage && (
                    <Link href={`/dashboard/expedientes/${expediente.id}/edit`}>
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar Expediente
                        </Button>
                    </Link>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Información General</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Año</p>
                                <p className="mt-1">{expediente.year || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                                <Badge variant="outline" className="mt-1">{expediente.type || "N/A"}</Badge>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Origen / Área</p>
                            <p className="mt-1">{expediente.origin || "No especificado"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Descripción / Motivo</p>
                            <p className="mt-1 whitespace-pre-wrap">{expediente.description || "Sin descripción"}</p>
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
                            <div className="rounded-md border">
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
                                                    <Badge variant="outline">{purchase.status}</Badge>
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
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No hay órdenes de compra vinculadas.</p>
                        )}
                    </div>

                    <Separator />

                    {/* Receipts Section */}
                    <div id="receipts" className="scroll-mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Remitos de Recepción
                                <Badge variant="secondary">{expediente.receipts.length}</Badge>
                            </h3>
                        </div>
                        {expediente.receipts.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Número</TableHead>
                                            <TableHead>OC Relacionada</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Monto Total</TableHead>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {expediente.receipts.map((receipt) => (
                                            <TableRow key={receipt.id}>
                                                <TableCell className="font-medium">{receipt.receiptNumber}</TableCell>
                                                <TableCell>{receipt.purchaseOrder?.orderNumber || "Directo"}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">
                                                        {receipt.type === "PURCHASE" ? "COMPRA" : 
                                                         receipt.type === "REINGRESO" ? "REINGRESO" : receipt.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(Number(receipt.totalAmount))}
                                                </TableCell>
                                                <TableCell>{format(new Date(receipt.date || receipt.createdAt), "dd/MM/yyyy", { locale: es })}</TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={`/dashboard/receipts/${receipt.id}`}>
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
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No hay remitos de recepción vinculados.</p>
                        )}
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
                            <div className="rounded-md border">
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
                                                    <Badge variant="outline">{delivery.status}</Badge>
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
                            <div className="rounded-md border">
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

                            // 2. Otros movimientos (Ajustes manuales, etc)
                            const otherMovements = expediente.movements
                                .filter(m => m.sourceType !== "RECEIPT")
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
                                <div className="rounded-md border">
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
                            );
                        })()}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
