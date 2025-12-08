import { getCurrentUser, hasPermission } from "@/lib/auth";
import { inventoryService } from "@/services/inventory-service";
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = 'force-static';

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user || !hasPermission(user, "inventory.view")) {
        redirect("/dashboard");
    }

    const product = await inventoryService.getProduct(id);

    if (!product) {
        return <div>Producto no encontrado</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 border-b pb-4">
                <div className="mb-2">
                    <Button variant="ghost" size="sm" asChild className="-ml-3 text-muted-foreground">
                        <Link href="/dashboard/inventory">← Volver al inventario</Link>
                    </Button>
                </div>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-mono bg-muted px-2 py-0.5 rounded">Código: {product.sku}</span>
                    <span>Categoría: {product.category?.name || "Sin categoría"}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                    {hasPermission(user, "inventory.manage") && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/inventory/${product.id}/edit`}>Editar</Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-3 space-y-6">
                    <div className="border rounded-lg p-6 bg-card">
                        <h3 className="font-semibold mb-4">Detalles</h3>
                        <p className="text-sm text-muted-foreground mb-4">{product.description || "Sin descripción"}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <div className="text-sm text-muted-foreground">Precio</div>
                                <div className="font-medium text-lg">${Number(product.price).toFixed(2)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Stock Total</div>
                                <div className={`font-medium text-lg ${product.stock <= product.minStock ? "text-red-500" : ""}`}>
                                    {product.stock}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Stock Mínimo</div>
                                <div className="font-medium text-lg text-muted-foreground">
                                    {product.minStock}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted/50 p-4 border-b font-semibold">Historial de Movimientos</div>
                        <div className="divide-y">
                            {product.movements.length === 0 ? (
                                <div className="p-8 text-center text-sm text-muted-foreground">No hay movimientos registrados</div>
                            ) : (
                                product.movements.map((move) => (
                                    <div key={move.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-full ${move.type === "IN" ? "bg-green-100 text-green-700" :
                                                move.type === "OUT" ? "bg-red-100 text-red-700" :
                                                    "bg-blue-100 text-blue-700"
                                                }`}>
                                                {move.type === "IN" ? <ArrowUpIcon className="w-5 h-5" /> :
                                                    move.type === "OUT" ? <ArrowDownIcon className="w-5 h-5" /> :
                                                        <MinusIcon className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    {move.type === "IN" ? "Ingreso de Stock" :
                                                        move.type === "OUT" ? "Salida de Stock" : "Ajuste de Inventario"}
                                                </div>
                                                <div className="text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                                    <span>
                                                        {move.warehouse ? (
                                                            <>
                                                                {move.type === "IN" ? "En" : "De"} <span className="font-medium text-foreground">{move.warehouse.name}</span>
                                                            </>
                                                        ) : "Ubicación desconocida"}
                                                    </span>
                                                    {move.reason && (
                                                        <>
                                                            <span className="hidden sm:inline">•</span>
                                                            <span className="italic">"{move.reason}"</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-bold text-lg ${move.type === "IN" ? "text-green-600" :
                                                move.type === "OUT" ? "text-red-600" : "text-blue-600"
                                                }`}>
                                                {move.type === "IN" ? "+" : "-"}{move.quantity}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {new Date(move.createdAt).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                por {move.user?.username || move.user?.email}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
