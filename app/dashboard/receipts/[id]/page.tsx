import { getCurrentUser, hasPermission } from "@/lib/auth";
import { getReceipt } from "@/app/actions/receipts";
import { UnauthorizedAccess } from "@/components/unauthorized-access";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function ReceiptDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "receipts.view")) {
        return <UnauthorizedAccess action="ver" resource="recepción" />;
    }

    const receipt = await getReceipt(id);
    if (!receipt) notFound();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/inventory">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Remito {receipt.receiptNumber}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Recibido el {format(new Date(receipt.date), "dd/MM/yyyy", { locale: es })}
                        </p>
                    </div>
                </div>
                <Link href={`/dashboard/receipts/${receipt.id}/edit`}>
                    <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Editar Remito
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Información General</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Orden de Compra Asociada</p>
                            <p className="mt-1 font-medium">{receipt.purchaseOrder?.orderNumber || "Ingreso Directo"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Proveedor</p>
                            <p className="mt-1">{receipt.purchaseOrder?.supplier?.name || receipt.supplier?.name || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Expediente</p>
                            <p className="mt-1">{receipt.expediente?.number || "Sin expediente"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Depósito Destino</p>
                            <p className="mt-1">{receipt.purchaseOrder?.warehouse?.name || receipt.warehouse?.name || "N/A"}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Detalles del Remito</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Importe</p>
                            <p className="mt-1 font-bold">${Number(receipt.totalAmount).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Fecha de Carga en Sistema</p>
                            <p className="mt-1">
                                {format(new Date(receipt.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Mercadería Recibida</CardTitle>
                    <CardDescription>Detalle de los artículos ingresados al stock mediante este remito</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead className="text-right">Cantidad Recibida</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {receipt.items.map((item: any) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.product.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{item.product.sku}</TableCell>
                                    <TableCell className="text-right font-bold text-primary">{item.quantity}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
