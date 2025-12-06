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

export const metadata = {
    title: "Deliveries | Inventory Control",
    description: "Manage deliveries to institutions",
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Deliveries</h1>
                    <p className="text-muted-foreground">
                        Manage deliveries to institutions
                    </p>
                </div>
                {canManage && (
                    <Button>
                        <Truck className="mr-2 h-4 w-4" />
                        New Delivery
                    </Button>
                )}
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList>
                    <TabsTrigger value="all">All ({allDeliveries.length})</TabsTrigger>
                    <TabsTrigger value="draft">Draft ({draftDeliveries.length})</TabsTrigger>
                    <TabsTrigger value="confirmed">Confirmed ({confirmedDeliveries.length})</TabsTrigger>
                    <TabsTrigger value="delivered">Delivered ({deliveredDeliveries.length})</TabsTrigger>
                </TabsList>

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
                    <h3 className="text-lg font-semibold mb-2">No deliveries found</h3>
                    <p className="text-sm text-muted-foreground">
                        Create a delivery to start distributing products
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Delivery #</TableHead>
                        <TableHead>Institution</TableHead>
                        <TableHead>Warehouse</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
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
                                    {delivery.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(delivery.createdAt), { addSuffix: true })}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
