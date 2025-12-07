import { getCurrentUser, hasPermission } from "@/lib/auth";
import {
    getStockByCategory,
    getStockByWarehouse,
    getMovementStats,
    getTopProductsByMovement,
    getLowStockProducts,
} from "@/app/actions/analytics";
import { UnauthorizedAccess } from "@/components/unauthorized-access";
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
    title: "Reportes y Analíticas | Control de Inventario",
    description: "Reportes completos de inventario y perspectivas",
};

export default async function ReportsPage() {
    const user = await getCurrentUser();

    if (!user || !hasPermission(user, "reports.view")) {
        return <UnauthorizedAccess action="ver" resource="reportes y analíticas" />;
    }

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
                <h1 className="text-3xl font-bold tracking-tight">Reportes y Analíticas</h1>
                <p className="text-muted-foreground">
                    Reportes completos de inventario y perspectivas
                </p>
            </div>

            {/* Movement Statistics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Movimientos</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{movementStats.totalMovements}</div>
                        <p className="text-xs text-muted-foreground">Últimos 30 días</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Entradas</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{movementStats.totalIn}</div>
                        <p className="text-xs text-muted-foreground">{movementStats.inCount} movimientos</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Salidas</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{movementStats.totalOut}</div>
                        <p className="text-xs text-muted-foreground">{movementStats.outCount} movimientos</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="stock" className="w-full">
                <div className="overflow-x-auto">
                    <TabsList className="inline-flex w-max">
                        <TabsTrigger value="stock">Reportes de Stock</TabsTrigger>
                        <TabsTrigger value="movements">Productos Más Movidos</TabsTrigger>
                        <TabsTrigger value="alerts">Alertas de Stock</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="stock" className="mt-6 space-y-4">
                    {/* Stock by Category */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock por Categoría</CardTitle>
                            <CardDescription>Desglose de inventario por categoría de producto</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Mobile Cards */}
                            <div className="block md:hidden space-y-4">
                                {stockByCategory.map((cat) => (
                                    <Card key={cat.categoryName}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <div className="font-medium">{cat.categoryName}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        <Badge variant="secondary">{cat.productCount} productos</Badge>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold">${cat.totalValue.toFixed(2)}</div>
                                                    <div className="text-sm text-muted-foreground">{cat.totalStock} unidades</div>
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
                                            <TableHead>Categoría</TableHead>
                                            <TableHead>Productos</TableHead>
                                            <TableHead>Stock Total</TableHead>
                                            <TableHead className="text-right">Valor Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stockByCategory.map((cat) => (
                                            <TableRow key={cat.categoryName}>
                                                <TableCell className="font-medium">{cat.categoryName}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{cat.productCount}</Badge>
                                                </TableCell>
                                                <TableCell>{cat.totalStock} unidades</TableCell>
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
                            <CardTitle>Stock por Almacén</CardTitle>
                            <CardDescription>Distribución de inventario en almacenes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Mobile Cards */}
                            <div className="block md:hidden space-y-4">
                                {stockByWarehouse.map((wh) => (
                                    <Card key={wh.warehouseCode}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <div className="font-medium">{wh.warehouseName}</div>
                                                    <div className="font-mono text-sm text-muted-foreground">{wh.warehouseCode}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        <Badge variant="secondary">{wh.productCount} productos</Badge>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold">${wh.totalValue.toFixed(2)}</div>
                                                    <div className="text-sm text-muted-foreground">{wh.totalStock} unidades</div>
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
                                            <TableHead>Almacén</TableHead>
                                            <TableHead>Código</TableHead>
                                            <TableHead>Productos</TableHead>
                                            <TableHead>Stock Total</TableHead>
                                            <TableHead className="text-right">Valor Total</TableHead>
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
                                                <TableCell>{wh.totalStock} unidades</TableCell>
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
                            <CardTitle>Productos Más Movidos</CardTitle>
                            <CardDescription>Productos más frecuentemente movidos (últimos 30 días)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Mobile Cards */}
                            <div className="block md:hidden space-y-4">
                                {topProducts.map((product) => (
                                    <Card key={product.productSku}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <div className="font-medium">{product.productName}</div>
                                                    <div className="font-mono text-sm text-muted-foreground">{product.productSku}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        <Badge variant="outline">{product.movementCount} movimientos</Badge>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold">{product.totalQuantity} unidades</div>
                                                    <div className="text-sm text-muted-foreground">Stock: {product.currentStock}</div>
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
                                            <TableHead>Producto</TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead>Cantidad de Movimientos</TableHead>
                                            <TableHead>Cantidad Total</TableHead>
                                            <TableHead className="text-right">Stock Actual</TableHead>
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
                                                <TableCell>{product.totalQuantity} unidades</TableCell>
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
                                Productos con Stock Bajo y Agotados
                            </CardTitle>
                            <CardDescription>Productos que requieren atención inmediata</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {lowStockProducts.length === 0 ? (
                                <p className="text-center py-8 text-muted-foreground">
                                    Todos los productos tienen niveles de stock adecuados
                                </p>
                            ) : (
                                <>
                                    {/* Mobile Cards */}
                                    <div className="block md:hidden space-y-4">
                                        {lowStockProducts.map((product) => (
                                            <Card key={product.id}>
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="space-y-1">
                                                            <div className="font-medium">{product.name}</div>
                                                            <div className="font-mono text-sm text-muted-foreground">{product.sku}</div>
                                                            <div className="text-sm text-muted-foreground">{product.category}</div>
                                                        </div>
                                                        <Badge variant={product.status === "out_of_stock" ? "destructive" : "secondary"}>
                                                            {product.status === "out_of_stock" ? "Agotado" : "Stock Bajo"}
                                                        </Badge>
                                                    </div>
                                                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-muted-foreground">Stock Actual:</span>
                                                            <span className="ml-2 font-medium">{product.currentStock}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">Stock Mínimo:</span>
                                                            <span className="ml-2 font-medium">{product.minStock}</span>
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
                                                    <TableHead>Producto</TableHead>
                                                    <TableHead>SKU</TableHead>
                                                    <TableHead>Categoría</TableHead>
                                                    <TableHead>Stock Actual</TableHead>
                                                    <TableHead>Stock Mínimo</TableHead>
                                                    <TableHead>Estado</TableHead>
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
                                                                {product.status === "out_of_stock" ? "Agotado" : "Stock Bajo"}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
