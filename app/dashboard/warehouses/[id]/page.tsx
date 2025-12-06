import { notFound } from "next/navigation";
import { getWarehouse, getWarehouseStock } from "@/app/actions/warehouses";
import { WarehouseForm } from "@/components/warehouses/warehouse-form";
import { TransferForm } from "@/components/warehouses/transfer-form";
import { getWarehouses } from "@/app/actions/warehouses";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Package, MapPin, ArrowLeft, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function WarehouseDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const warehouse = await getWarehouse(params.id);

    if (!warehouse) {
        notFound();
    }

    const warehouses = await getWarehouses();
    const user = await getCurrentUser();
    const stock = warehouse.stockItems || [];

    const lowStockItems = stock.filter(
        (item) => item.quantity <= item.product.minStock
    );

    const totalProducts = stock.filter((item) => item.quantity > 0).length;
    const totalQuantity = stock.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/warehouses">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{warehouse.name}</h1>
                        <Badge variant={warehouse.isActive ? "default" : "secondary"}>
                            {warehouse.isActive ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground font-mono text-sm mt-1">
                        {warehouse.code}
                    </p>
                </div>
                <div className="flex gap-2">
                    <TransferForm
                        warehouses={warehouses}
                        userId={user!.id}
                        defaultFromWarehouseId={warehouse.id}
                        trigger={
                            <Button variant="outline">
                                <ArrowRight className="mr-2 h-4 w-4" />
                                Transfer Stock
                            </Button>
                        }
                    />
                    <WarehouseForm warehouse={warehouse} />
                </div>
            </div>

            {/* Warehouse Info */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {warehouse.description && (
                            <div>
                                <p className="text-sm text-muted-foreground">Description</p>
                                <p className="text-sm">{warehouse.description}</p>
                            </div>
                        )}
                        {warehouse.address && (
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Address</p>
                                    <p className="text-sm">{warehouse.address}</p>
                                </div>
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
                            <span className="text-sm text-muted-foreground">Products</span>
                            <span className="text-2xl font-bold">{totalProducts}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Total Quantity</span>
                            <span className="text-2xl font-bold">{totalQuantity}</span>
                        </div>
                        {lowStockItems.length > 0 && (
                            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-sm">{lowStockItems.length} low stock items</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Stock Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Inventory</CardTitle>
                    <CardDescription>
                        Current stock levels for this warehouse
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {stock.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Package className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No stock in this warehouse</h3>
                            <p className="text-sm text-muted-foreground">
                                Transfer products to this warehouse to get started
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Min Stock</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stock.map((item) => {
                                        const isLowStock = item.quantity <= item.product.minStock;
                                        const isOutOfStock = item.quantity === 0;

                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-mono text-sm">
                                                    {item.product.sku}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {item.product.name}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {item.product.category?.name || "-"}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{item.quantity}</Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {item.product.minStock}
                                                </TableCell>
                                                <TableCell>
                                                    {isOutOfStock ? (
                                                        <Badge variant="destructive">Out of Stock</Badge>
                                                    ) : isLowStock ? (
                                                        <Badge variant="outline" className="border-orange-500 text-orange-600">
                                                            Low Stock
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline">In Stock</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
