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
import { getWarehouses } from "@/app/actions/warehouses";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { UnauthorizedAccess } from "@/components/unauthorized-access";
import { ProductActions } from "@/components/inventory/product-actions";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-static';

export default async function InventoryPage() {
    const user = await getCurrentUser();

    if (!user || !hasPermission(user, "inventory.view")) {
        return <UnauthorizedAccess action="ver" resource="inventario" />;
    }

    const rawProducts = await inventoryService.getProducts();
    const products = rawProducts.map(product => ({
        ...product,
        price: Number(product.price),
    }));
    const canCreate = hasPermission(user, "inventory.manage");
    const canEdit = hasPermission(user, "inventory.manage");
    const canDelete = hasPermission(user, "inventory.manage");

    // Obtener depósitos para la acción de asignación de stock
    const warehouses = await getWarehouses();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Inventario</h1>
                {canCreate && (
                    <Button asChild>
                        <Link href="/dashboard/inventory/create">Nuevo Producto</Link>
                    </Button>
                )}
            </div>

            {/* Desktop Table View */}
            <div className="border rounded-lg hidden md:block">
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
                                            canEdit={canEdit}
                                            canDelete={canDelete}
                                            warehouses={warehouses}
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
                                    canEdit={canEdit}
                                    canDelete={canDelete}
                                    warehouses={warehouses}
                                    userId={user.id}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
