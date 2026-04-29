import { getCurrentUser, hasPermission } from "@/lib/auth";
import { getExpediente } from "@/app/actions/expedientes";
import { UnauthorizedAccess } from "@/components/unauthorized-access";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
                        <CardDescription>Operaciones vinculadas a este expediente</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm font-medium text-muted-foreground">Órdenes de Compra</span>
                            <span className="font-bold">{expediente.purchases.length}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm font-medium text-muted-foreground">Remitos de Recepción</span>
                            <span className="font-bold">{expediente.receipts.length}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm font-medium text-muted-foreground">Entregas</span>
                            <span className="font-bold">{expediente.deliveries.length}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm font-medium text-muted-foreground">Transferencias</span>
                            <span className="font-bold">{expediente.transfers.length}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm font-medium text-muted-foreground">Movimientos de Stock</span>
                            <span className="font-bold">{expediente.movements.length}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Trazabilidad Completa</CardTitle>
                    <CardDescription>Próximamente se listarán aquí todos los eventos cronológicos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Las listas detalladas de órdenes, entregas y recibos vinculadas a este expediente irán aquí.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
