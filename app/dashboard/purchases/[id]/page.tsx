import { notFound } from "next/navigation";
import { getPurchaseOrder, submitPurchaseOrder, cancelPurchaseOrder } from "@/app/actions/purchases";
import { getCurrentUser } from "@/lib/auth";
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
import { ArrowLeft, Building2, MapPin, Calendar, CheckCircle, XCircle, Send } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ReceiveDialog } from "@/components/purchases/receive-dialog";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/* Next.js 15: params is a Promise */
export default async function PurchaseOrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const order = await getPurchaseOrder(id);
    const user = await getCurrentUser();

    if (!order) {
        notFound();
    }

    if (!user) redirect("/login");

    // Server Actions for simple buttons
    async function submitOrder() {
        "use server";
        await submitPurchaseOrder(id);
        redirect(`/dashboard/purchases/${id}`); // Refresh page
    }

    async function cancelOrder() {
        "use server";
        await cancelPurchaseOrder(id);
        redirect(`/dashboard/purchases/${id}`); // Refresh page
    }

    const isDraft = order.status === "DRAFT";
    const isReceivable = order.status === "PENDING" || order.status === "PARTIAL";
    const isCancelled = order.status === "CANCELLED";

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/purchases">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{order.orderNumber}</h1>
                        <Badge variant={
                            order.status === "RECEIVED" ? "outline" :
                                order.status === "CANCELLED" ? "destructive" :
                                    "default"
                        }>
                            {order.status}
                        </Badge>
                    </div>
                </div>
                <div className="flex gap-2">
                    {isDraft && (
                        <>
                            <form action={cancelOrder}>
                                <Button variant="destructive" size="sm">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel
                                </Button>
                            </form>
                            <form action={submitOrder}>
                                <Button size="sm">
                                    <Send className="mr-2 h-4 w-4" />
                                    Submit Order
                                </Button>
                            </form>
                        </>
                    )}
                    {isReceivable && (
                        <ReceiveDialog order={JSON.parse(JSON.stringify(order))} userId={user.id} />
                    )}
                    {!isDraft && !isCancelled && !isReceivable && order.status !== "RECEIVED" && (
                        <form action={cancelOrder}>
                            <Button variant="destructive" size="sm">Cancel Order</Button>
                        </form>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Supplier</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-start gap-4">
                        <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                            <div className="font-semibold">{order.supplier.name}</div>
                            <div className="text-sm text-muted-foreground">{order.supplier.email}</div>
                            {order.supplier.phone && (
                                <div className="text-sm text-muted-foreground">{order.supplier.phone}</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Delivery To</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-start gap-4">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                            <div className="font-semibold">{order.warehouse.name}</div>
                            <div className="text-sm text-muted-foreground">{order.warehouse.address}</div>
                            <div className="text-sm text-muted-foreground font-mono">{order.warehouse.code}</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Order Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Expected:</span>
                            <span>{order.expectedDate ? format(new Date(order.expectedDate), "PPP") : "Not set"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Created:</span>
                            <span>{format(new Date(order.createdAt), "PPP")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Total:</span>
                            <span className="font-bold">${Number(order.totalAmount).toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Received</TableHead>
                                <TableHead className="text-right">Unit Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.product.name}</TableCell>
                                    <TableCell className="font-mono text-xs">{item.product.sku}</TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                    <TableCell className="text-right">
                                        <span className={
                                            item.receivedQty === item.quantity ? "text-green-600 font-medium" :
                                                item.receivedQty > 0 ? "text-orange-600 font-medium" :
                                                    "text-muted-foreground"
                                        }>
                                            {item.receivedQty}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">${Number(item.unitPrice).toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-medium">
                                        ${(item.quantity * Number(item.unitPrice)).toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {order.notes && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.notes}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
