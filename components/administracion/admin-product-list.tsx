"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, AlertTriangle, Package } from "lucide-react";
import { updateMinStockAction } from "@/app/actions/inventory";

interface StockByWarehouse {
    warehouseId: string;
    warehouseName: string;
    quantity: number;
}

interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    minStock: number;
    unit: string;
    categoryName: string | null;
    totalStock: number;
    stockByWarehouse: StockByWarehouse[];
    isDeleted: boolean;
}

interface AdminProductListProps {
    products: Product[];
    warehouses: { id: string; name: string }[];
    canManage: boolean;
}

export function AdminProductList({ products, warehouses, canManage }: AdminProductListProps) {
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [minStockValue, setMinStockValue] = useState<number>(0);
    const [loading, setLoading] = useState<string | null>(null);

    const filtered = products.filter(
        (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase()) ||
            p.categoryName?.toLowerCase().includes(search.toLowerCase())
    );

    const activeProducts = filtered.filter((p) => !p.isDeleted);
    const deletedProducts = filtered.filter((p) => p.isDeleted);

    const startEditing = (product: Product) => {
        setEditingId(product.id);
        setMinStockValue(product.minStock);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setMinStockValue(0);
    };

    const saveMinStock = async (productId: string) => {
        if (loading) return;
        setLoading(productId);
        try {
            await updateMinStockAction(productId, minStockValue);
            setEditingId(null);
            window.location.reload();
        } catch (error) {
            console.error("Error saving minStock:", error);
        } finally {
            setLoading(null);
        }
    };

    const getStockByWarehouse = (stockByWarehouse: StockByWarehouse[]) => {
        if (stockByWarehouse.length === 0) return "-";
        
        return (
            <div className="flex flex-wrap gap-1">
                {stockByWarehouse.map((sw) => (
                    <Badge
                        key={sw.warehouseId}
                        variant={sw.quantity > 0 ? "outline" : "destructive"}
                        className="text-[10px] py-0 px-1.5"
                    >
                        {sw.warehouseName}: {sw.quantity}
                    </Badge>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center relative max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar productos..."
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>SKU</TableHead>
                            <TableHead>Producto</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead className="text-center">Total</TableHead>
                            <TableHead>Stock por Depósito</TableHead>
                            <TableHead className="text-center">Mín</TableHead>
                            <TableHead className="text-center">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activeProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No se encontraron productos
                                </TableCell>
                            </TableRow>
                        ) : (
                            activeProducts.map((product) => (
                                <TableRow key={product.id} className={product.isDeleted ? "opacity-50" : ""}>
                                    <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{product.name}</span>
                                            {product.totalStock <= product.minStock && product.totalStock > 0 && (
                                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                            )}
                                            {product.totalStock === 0 && (
                                                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            ${product.price.toFixed(2)} / {product.unit}
                                        </div>
                                    </TableCell>
                                    <TableCell>{product.categoryName || "-"}</TableCell>
                                    <TableCell className="text-center">
                                        <div
                                            className={`font-semibold ${
                                                product.totalStock === 0
                                                    ? "text-red-600"
                                                    : product.totalStock <= product.minStock
                                                    ? "text-amber-600"
                                                    : "text-green-600"
                                            }`}
                                        >
                                            {product.totalStock}
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStockByWarehouse(product.stockByWarehouse)}</TableCell>
                                    <TableCell className="text-center">
                                        {editingId === product.id ? (
                                            <div className="flex items-center justify-center gap-1">
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={minStockValue}
                                                    onChange={(e) => setMinStockValue(parseInt(e.target.value) || 0)}
                                                    className="h-7 w-16 text-center"
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => saveMinStock(product.id)}
                                                    disabled={loading === product.id}
                                                >
                                                    ✓
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={cancelEditing}>
                                                    ✕
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-1">
                                                <span>{product.minStock}</span>
                                                {canManage && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 px-1"
                                                        onClick={() => startEditing(product)}
                                                    >
                                                        ✎
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {canManage && editingId !== product.id && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => startEditing(product)}
                                            >
                                                Editar Mín
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {deletedProducts.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Productos eliminados ({deletedProducts.length})
                    </h3>
                    <div className="border rounded-md opacity-60">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead className="text-center">Stock Total</TableHead>
                                    <TableHead>Stock por Depósito</TableHead>
                                    <TableHead className="text-center">Mín</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deletedProducts.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                                        <TableCell>
                                            <span className="line-through">{product.name}</span>
                                        </TableCell>
                                        <TableCell>{product.categoryName || "-"}</TableCell>
                                        <TableCell className="text-center">{product.totalStock}</TableCell>
                                        <TableCell>{getStockByWarehouse(product.stockByWarehouse)}</TableCell>
                                        <TableCell className="text-center">{product.minStock}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
}