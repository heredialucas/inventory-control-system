import { getCurrentUser, hasPermission } from "@/lib/auth";
import { getPurchaseOrders } from "@/app/actions/purchases";
import { UnauthorizedAccess } from "@/components/unauthorized-access";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export const metadata = {
    title: "Purchase Orders | Inventory Control",
    description: "Manage purchase orders and receiving",
};

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    DRAFT: "secondary",
    PENDING: "default",
    PARTIAL: "outline",
    RECEIVED: "outline",
    CANCELLED: "destructive",
};

export default async function PurchasesPage() {
    const user = await getCurrentUser();

    if (!user || !hasPermission(user, "purchases.view")) {
        return <UnauthorizedAccess action="ver" resource="órdenes de compra" />;
    }

    const allOrders = await getPurchaseOrders();
    const draftOrders = allOrders.filter((o) => o.status === "DRAFT");
    const pendingOrders = allOrders.filter((o) => o.status === "PENDING");
    const receivedOrders = allOrders.filter((o) => o.status === "RECEIVED" || o.status === "PARTIAL");
    const canManage = hasPermission(user, "purchases.manage");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
                    <p className="text-muted-foreground">
                        Manage purchase orders and inventory receiving
                    </p>
                </div>
                {canManage && (
                    <Button asChild>
                        <Link href="/dashboard/purchases/new">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            New Purchase Order
                        </Link>
                    </Button>
                )}
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList>
                    <TabsTrigger value="all">All ({allOrders.length})</TabsTrigger>
                    <TabsTrigger value="draft">Draft ({draftOrders.length})</TabsTrigger>
                    <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
                    <TabsTrigger value="received">Received ({receivedOrders.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                    <PurchaseOrderTable orders={allOrders} />
                </TabsContent>
                <TabsContent value="draft" className="mt-6">
                    <PurchaseOrderTable orders={draftOrders} />
                </TabsContent>
                <TabsContent value="pending" className="mt-6">
                    <PurchaseOrderTable orders={pendingOrders} />
                </TabsContent>
                <TabsContent value="received" className="mt-6">
                    <PurchaseOrderTable orders={receivedOrders} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function PurchaseOrderTable({ orders }: { orders: any[] }) {
    if (orders.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No purchase orders found</h3>
                    <p className="text-sm text-muted-foreground">
                        Create a purchase order to start receiving inventory
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
                        <TableHead>Order Number</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Warehouse</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell className="font-mono font-medium">
                                <Link
                                    href={`/dashboard/purchases/${order.id}`}
                                    className="hover:underline"
                                >
                                    {order.orderNumber}
                                </Link>
                            </TableCell>
                            <TableCell>
                                <Link
                                    href={`/dashboard/suppliers/${order.supplier.id}`}
                                    className="hover:underline"
                                >
                                    {order.supplier.name}
                                </Link>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {order.warehouse.name}
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary">{order._count.items}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                                ${Number(order.totalAmount).toFixed(2)}
                            </TableCell>
                            <TableCell>
                                <Badge variant={statusColors[order.status]}>
                                    {order.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
