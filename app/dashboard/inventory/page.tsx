import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { inventoryService } from "@/services/inventory-service";
import { getReceipts } from "@/app/actions/receipts";
import { getWarehouses } from "@/app/actions/warehouses";
import { getSuppliers } from "@/app/actions/suppliers";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { UnauthorizedAccess } from "@/components/unauthorized-access";
import { ProductActions } from "@/components/inventory/product-actions";
import { Badge } from "@/components/ui/badge";
import { ReceiptList } from "@/components/receipts/receipt-list";
import { Package, Plus, FileText, LayoutGrid } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function InventoryPage() {
    const user = await getCurrentUser();

    if (!user || (!hasPermission(user, "inventory.view") && !hasPermission(user, "receipts.view"))) {
        return <UnauthorizedAccess action="ver" resource="ingresos" />;
    }

    const [rawProducts, receipts, warehouses, suppliers] = await Promise.all([
        inventoryService.getProducts(),
        getReceipts(),
        getWarehouses(),
        getSuppliers().catch(() => []),
    ]);

    const products = rawProducts.map(product => ({
        ...product,
        price: Number(product.price),
    }));
    
    const canManageInventory = hasPermission(user, "inventory.manage");
    const canViewInventory = hasPermission(user, "inventory.view");
    const canManageReceipts = hasPermission(user, "receipts.manage");
    const canViewReceipts = hasPermission(user, "receipts.view");

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Ingresos</h1>
                    <p className="text-muted-foreground">
                        Gestión de remitos y stock de mercadería
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {canManageReceipts && (
                        <Button asChild>
                            <Link href="/dashboard/receipts/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Cargar Remito
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Historial de Remitos (Vista Principal) */}
            {canViewReceipts && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                        <FileText className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Historial de Remitos</h2>
                    </div>
                    <ReceiptList receipts={receipts} canManage={canManageReceipts} />
                </div>
            )}

            <Separator />

            {/* Stock Actual */}
            {canViewInventory && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                        <LayoutGrid className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Stock Actual</h2>
                    </div>

                    {/* Desktop Table View */}
                    <div className="border rounded-lg hidden md:block bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Código</TableHead>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Precio</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No hay productos registrados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    products.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.sku}</TableCell>
                                            <TableCell>{product.name}</TableCell>
                                            <TableCell>{product.category?.name || "-"}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span className={product.stock <= product.minStock ? "text-red-500 font-bold" : ""}>
                                                        {product.stock}
                                                    </span>
                                                    {product.stock === 0 && (
                                                        <Badge variant="outline" className="w-fit text-xs border-yellow-500 text-yellow-600 bg-yellow-50">
                                                            Sin Asignar
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                                            <TableCell className="text-right">
                                                <ProductActions
                                                    productId={product.id}
                                                    productName={product.name}
                                                    productSku={product.sku}
                                                    canEdit={canManageInventory}
                                                    canDelete={canManageInventory}
                                                    warehouses={warehouses}
                                                    suppliers={suppliers}
                                                    userId={user.id}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {products.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground border rounded-lg">
                                No hay productos registrados.
                            </div>
                        ) : (
                            products.map((product) => (
                                <div key={product.id} className="border rounded-lg p-4 bg-card shadow-sm flex flex-col gap-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold">{product.name}</h3>
                                            <div className="text-xs text-muted-foreground font-mono mt-1">Código: {product.sku}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold">${Number(product.price).toFixed(2)}</div>
                                            <div className={`text-xs ${product.stock <= product.minStock ? "text-red-500 font-bold" : "text-muted-foreground"}`}>
                                                Stock: {product.stock}
                                            </div>
                                            {product.stock === 0 && (
                                                <Badge variant="outline" className="mt-1 text-xs border-yellow-500 text-yellow-600 bg-yellow-50">
                                                    Sin Asignar
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="bg-muted px-2 py-0.5 rounded text-xs">
                                            {product.category?.name || "Sin categoría"}
                                        </span>
                                        <ProductActions
                                            productId={product.id}
                                            productName={product.name}
                                            productSku={product.sku}
                                            canEdit={canManageInventory}
                                            canDelete={canManageInventory}
                                            warehouses={warehouses}
                                            suppliers={suppliers}
                                            userId={user.id}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
