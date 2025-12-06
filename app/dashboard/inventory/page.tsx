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
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { UnauthorizedAccess } from "@/components/unauthorized-access";

export default async function InventoryPage() {
    const user = await getCurrentUser();

    if (!user || !hasPermission(user, "inventory.view")) {
        return <UnauthorizedAccess action="ver" resource="inventario" />;
    }

    const products = await inventoryService.getProducts();
    const canCreate = hasPermission(user, "inventory.manage");

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
                            <TableHead>SKU</TableHead>
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
                                        <span className={product.stock <= product.minStock ? "text-red-500 font-bold" : ""}>
                                            {product.stock}
                                        </span>
                                    </TableCell>
                                    <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/dashboard/inventory/${product.id}`}>Ver</Link>
                                        </Button>
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
                                    <div className="text-xs text-muted-foreground font-mono mt-1">{product.sku}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold">${Number(product.price).toFixed(2)}</div>
                                    <div className={`text-xs ${product.stock <= product.minStock ? "text-red-500 font-bold" : "text-muted-foreground"}`}>
                                        Stock: {product.stock}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="bg-muted px-2 py-0.5 rounded text-xs">
                                    {product.category?.name || "Sin categoría"}
                                </span>
                                <Button variant="outline" size="sm" asChild className="h-8">
                                    <Link href={`/dashboard/inventory/${product.id}`}>Ver Detalles</Link>
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
