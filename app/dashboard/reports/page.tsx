import {
    getStockByCategory,
    getStockByWarehouse,
    getMovementStats,
    getTopProductsByMovement,
    getLowStockProducts,
} from "@/app/actions/analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, BarChart3, TrendingUp, TrendingDown } from "lucide-react";

export const metadata = {
    title: "Reports & Analytics | Inventory Control",
    description: "Inventory reports and analytics",
};

export default async function ReportsPage() {
    const [
        stockByCategory,
        stockByWarehouse,
        movementStats,
        topProducts,
        lowStockProducts,
    ] = await Promise.all([
        getStockByCategory(),
        getStockByWarehouse(),
        getMovementStats(30),
        getTopProductsByMovement(10, 30),
        getLowStockProducts(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                <p className="text-muted-foreground">
                    Comprehensive inventory reports and insights
                </p>
            </div>

            {/* Movement Statistics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Movements</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{movementStats.totalMovements}</div>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Stock In</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{movementStats.totalIn}</div>
                        <p className="text-xs text-muted-foreground">{movementStats.inCount} movements</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Stock Out</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{movementStats.totalOut}</div>
                        <p className="text-xs text-muted-foreground">{movementStats.outCount} movements</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="stock" className="w-full">
                <TabsList>
                    <TabsTrigger value="stock">Stock Reports</TabsTrigger>
                    <TabsTrigger value="movements">Top Products</TabsTrigger>
                    <TabsTrigger value="alerts">Stock Alerts</TabsTrigger>
                </TabsList>

                <TabsContent value="stock" className="mt-6 space-y-4">
                    {/* Stock by Category */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock by Category</CardTitle>
                            <CardDescription>Inventory breakdown by product category</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Products</TableHead>
                                            <TableHead>Total Stock</TableHead>
                                            <TableHead className="text-right">Total Value</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stockByCategory.map((cat) => (
                                            <TableRow key={cat.categoryName}>
                                                <TableCell className="font-medium">{cat.categoryName}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{cat.productCount}</Badge>
                                                </TableCell>
                                                <TableCell>{cat.totalStock} units</TableCell>
                                                <TableCell className="text-right font-medium">
                                                    ${cat.totalValue.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stock by Warehouse */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock by Warehouse</CardTitle>
                            <CardDescription>Inventory distribution across warehouses</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Warehouse</TableHead>
                                            <TableHead>Code</TableHead>
                                            <TableHead>Products</TableHead>
                                            <TableHead>Total Stock</TableHead>
                                            <TableHead className="text-right">Total Value</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stockByWarehouse.map((wh) => (
                                            <TableRow key={wh.warehouseCode}>
                                                <TableCell className="font-medium">{wh.warehouseName}</TableCell>
                                                <TableCell className="font-mono text-sm">{wh.warehouseCode}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{wh.productCount}</Badge>
                                                </TableCell>
                                                <TableCell>{wh.totalStock} units</TableCell>
                                                <TableCell className="text-right font-medium">
                                                    ${wh.totalValue.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="movements" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Products by Movement</CardTitle>
                            <CardDescription>Most frequently moved products (last 30 days)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead>Movement Count</TableHead>
                                            <TableHead>Total Quantity</TableHead>
                                            <TableHead className="text-right">Current Stock</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {topProducts.map((product) => (
                                            <TableRow key={product.productSku}>
                                                <TableCell className="font-medium">{product.productName}</TableCell>
                                                <TableCell className="font-mono text-sm">{product.productSku}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{product.movementCount}</Badge>
                                                </TableCell>
                                                <TableCell>{product.totalQuantity} units</TableCell>
                                                <TableCell className="text-right">{product.currentStock}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="alerts" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                Low Stock & Out of Stock Products
                            </CardTitle>
                            <CardDescription>Products requiring immediate attention</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {lowStockProducts.length === 0 ? (
                                <p className="text-center py-8 text-muted-foreground">
                                    All products have adequate stock levels
                                </p>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead>SKU</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Current Stock</TableHead>
                                                <TableHead>Min Stock</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {lowStockProducts.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell className="font-medium">{product.name}</TableCell>
                                                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                                                    <TableCell>{product.category}</TableCell>
                                                    <TableCell>{product.currentStock}</TableCell>
                                                    <TableCell>{product.minStock}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={product.status === "out_of_stock" ? "destructive" : "secondary"}>
                                                            {product.status === "out_of_stock" ? "Out of Stock" : "Low Stock"}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
