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

export default async function SupplierDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const supplier = await getSupplier(params.id);

    if (!supplier) {
        notFound();
    }

    const purchaseOrders = await getPurchaseOrders({ supplierId: params.id });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/suppliers">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{supplier.name}</h1>
                        <Badge variant={supplier.isActive ? "default" : "secondary"}>
                            {supplier.isActive ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground font-mono text-sm mt-1">
                        {supplier.code}
                    </p>
                </div>
                <SupplierForm supplier={supplier} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
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
                                <p className="text-sm text-muted-foreground">Notes</p>
                                <p className="text-sm whitespace-pre-wrap">{supplier.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Total Orders</span>
                            <span className="text-2xl font-bold">{purchaseOrders.length}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Purchase Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    {purchaseOrders.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No purchase orders found
                        </p>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order Number</TableHead>
                                        <TableHead>Warehouse</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
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
                                                <Badge variant="outline">{order.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
