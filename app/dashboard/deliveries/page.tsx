import { getCurrentUser, hasPermission } from "@/lib/auth";
import { getDeliveries } from "@/app/actions/deliveries";
import { UnauthorizedAccess } from "@/components/unauthorized-access";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Truck } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export const metadata = {
    title: "Entregas | Control de Inventario",
    description: "Gestionar entregas a instituciones",
};

const getDeliveryStatusLabel = (status: string) => {
    switch (status) {
        case "DRAFT":
            return "Borrador";
        case "CONFIRMED":
            return "Confirmado";
        case "DELIVERED":
            return "Entregado";
        case "CANCELLED":
            return "Cancelado";
        default:
            return status;
    }
};

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    DRAFT: "secondary",
    CONFIRMED: "default",
    DELIVERED: "outline",
    CANCELLED: "destructive",
};

export default async function DeliveriesPage() {
    const user = await getCurrentUser();

    if (!user || !hasPermission(user, "deliveries.view")) {
        return <UnauthorizedAccess action="ver" resource="entregas" />;
    }

    const allDeliveries = await getDeliveries();
    const draftDeliveries = allDeliveries.filter((d) => d.status === "DRAFT");
    const confirmedDeliveries = allDeliveries.filter((d) => d.status === "CONFIRMED");
    const deliveredDeliveries = allDeliveries.filter((d) => d.status === "DELIVERED");
    const canManage = hasPermission(user, "deliveries.manage");

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Entregas</h1>
                    <p className="text-muted-foreground">
                        Gestionar entregas a instituciones
                    </p>
                </div>
                {canManage && (
                    <Button asChild>
                        <Link href="/dashboard/deliveries/new">
                            <Truck className="mr-2 h-4 w-4" />
                            Nueva Entrega
                        </Link>
                    </Button>
                )}
            </div>

            <Tabs defaultValue="all" className="w-full">
                <div className="overflow-x-auto">
                    <TabsList className="inline-flex w-max">
                        <TabsTrigger value="all">Todas ({allDeliveries.length})</TabsTrigger>
                        <TabsTrigger value="draft">Borrador ({draftDeliveries.length})</TabsTrigger>
                        <TabsTrigger value="confirmed">Confirmado ({confirmedDeliveries.length})</TabsTrigger>
                        <TabsTrigger value="delivered">Entregadas ({deliveredDeliveries.length})</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="all" className="mt-6">
                    <DeliveryTable deliveries={allDeliveries} />
                </TabsContent>
                <TabsContent value="draft" className="mt-6">
                    <DeliveryTable deliveries={draftDeliveries} />
                </TabsContent>
                <TabsContent value="confirmed" className="mt-6">
                    <DeliveryTable deliveries={confirmedDeliveries} />
                </TabsContent>
                <TabsContent value="delivered" className="mt-6">
                    <DeliveryTable deliveries={deliveredDeliveries} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function DeliveryTable({ deliveries }: { deliveries: any[] }) {
    if (deliveries.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No se encontraron entregas</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Crea una entrega para comenzar a distribuir productos
                    </p>
                    <Button asChild>
                        <Link href="/dashboard/deliveries/new">
                            Crear Entrega
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            {/* Mobile Cards */}
            <div className="block md:hidden space-y-4">
                {deliveries.map((delivery) => (
                    <Card key={delivery.id}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <Link
                                        href={`/dashboard/deliveries/${delivery.id}`}
                                        className="font-mono font-medium text-lg hover:underline"
                                    >
                                        {delivery.deliveryNumber}
                                    </Link>
                                    <div className="text-sm text-muted-foreground">
                                        <Link
                                            href={`/dashboard/institutions/${delivery.institution.id}`}
                                            className="hover:underline"
                                        >
                                            {delivery.institution.name}
                                        </Link>
                                    </div>
                                    <div className="text-sm text-muted-foreground">{delivery.warehouse.name}</div>
                                </div>
                                <Badge variant={statusColors[delivery.status]}>
                                    {getDeliveryStatusLabel(delivery.status)}
                                </Badge>
                            </div>
                            <div className="mt-4 flex items-center justify-between text-sm">
                                <div>
                                    <Badge variant="secondary">{delivery._count.items} artículos</Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(delivery.createdAt), { addSuffix: true, locale: es })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Número de Entrega</TableHead>
                            <TableHead>Institución</TableHead>
                            <TableHead>Almacén</TableHead>
                            <TableHead>Artículos</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Creado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {deliveries.map((delivery) => (
                            <TableRow key={delivery.id}>
                                <TableCell className="font-mono font-medium">
                                    <Link
                                        href={`/dashboard/deliveries/${delivery.id}`}
                                        className="hover:underline"
                                    >
                                        {delivery.deliveryNumber}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <Link
                                        href={`/dashboard/institutions/${delivery.institution.id}`}
                                        className="hover:underline"
                                    >
                                        {delivery.institution.name}
                                    </Link>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {delivery.warehouse.name}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{delivery._count.items}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={statusColors[delivery.status]}>
                                        {getDeliveryStatusLabel(delivery.status)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {formatDistanceToNow(new Date(delivery.createdAt), { addSuffix: true, locale: es })}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
