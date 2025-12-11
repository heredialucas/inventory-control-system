import { getDashboardStats, getLowStockProducts, getRecentActivity } from "@/app/actions/analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Package,
    Warehouse,
    Users,
    Building2,
    AlertTriangle,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Panel de Control | Control de Inventario",
    description: "Vista general del sistema de inventario",
};

export default async function DashboardPage() {
    const user = await getCurrentUser();

    // Solo usuarios con rol ADMIN pueden ver el dashboard
    // Los demás usuarios serán redirigidos a su perfil
    const isAdmin = user?.userRoles?.some((ur: any) => ur.role.name === "ADMIN");
    
    if (!user || !isAdmin) {
        redirect("/dashboard/users");
    }

    const stats = await getDashboardStats();
    const lowStockProducts = await getLowStockProducts();
    const recentActivity = await getRecentActivity(5);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "CANCELADO":
                return "destructive";
            case "ENTREGADO":
            case "COMPLETADO":
            case "APROBADO":
                return "default";
            case "PENDIENTE":
            case "BORRADOR":
                return "secondary";
            case "CONFIRMADO":
            case "EN_TRANSITO":
                return "outline";
            default:
                return "outline";
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
                <p className="text-muted-foreground">
                    Vista general de tu sistema de inventario
                </p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Productos Totales</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalProducts}</div>
                        <Link href="/dashboard/products" className="text-xs text-muted-foreground hover:underline">
                            Ver todos los productos
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Almacenes</CardTitle>
                        <Warehouse className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalWarehouses}</div>
                        <Link href="/dashboard/warehouses" className="text-xs text-muted-foreground hover:underline">
                            Ver almacenes
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Proveedores</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalSuppliers}</div>
                        <Link href="/dashboard/suppliers" className="text-xs text-muted-foreground hover:underline">
                            Ver proveedores
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Instituciones</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalInstitutions}</div>
                        <Link href="/dashboard/institutions" className="text-xs text-muted-foreground hover:underline">
                            Ver instituciones
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transferencias Pendientes</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingTransfers}</div>
                        <p className="text-xs text-muted-foreground">
                            Esperando completarse
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Compras Pendientes</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingPurchases}</div>
                        <p className="text-xs text-muted-foreground">
                            Esperando recepción
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Entregas Pendientes</CardTitle>
                        <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingDeliveries}</div>
                        <p className="text-xs text-muted-foreground">
                            Esperando entrega
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Low Stock Alert & Recent Activity */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            Alertas de Stock Bajo
                        </CardTitle>
                        <CardDescription>
                            Productos que necesitan atención
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {lowStockProducts.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Todos los productos tienen stock adecuado
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {lowStockProducts.slice(0, 5).map((product) => (
                                    <div key={product.id} className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{product.name}</p>
                                            <p className="text-xs text-muted-foreground">{product.category}</p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={product.status === "out_of_stock" ? "destructive" : "secondary"}>
                                                {product.currentStock} unidades
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                {lowStockProducts.length > 5 && (
                                    <Link href="/dashboard/reports" className="text-sm text-blue-600 hover:underline block text-center pt-2">
                                        Ver todos los {lowStockProducts.length} productos con stock bajo
                                    </Link>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Actividad Reciente</CardTitle>
                        <CardDescription>
                            Últimos eventos del sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentActivity.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Sin actividad reciente
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {recentActivity.map((activity, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex-1 space-y-1">
                                            {activity.type === "movimiento" ? (
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={activity.description.startsWith("ENTRADA") ? "default" : "destructive"}>
                                                        {activity.description.split(" ")[0]}
                                                    </Badge>
                                                    <p className="text-sm">{activity.description.split(": ")[1]}</p>
                                                </div>
                                            ) : activity.description.includes(" - ") ? (
                                                (() => {
                                                    const [desc, status] = activity.description.split(" - ");
                                                    return (
                                                        <div className="space-y-1">
                                                            <p className="text-sm">{desc}</p>
                                                            <Badge variant={getStatusVariant(status)} className="w-fit">
                                                                {status}
                                                            </Badge>
                                                        </div>
                                                    );
                                                })()
                                            ) : (
                                                <p className="text-sm">{activity.description}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(activity.date), { addSuffix: true, locale: es })}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="ml-2 shrink-0">
                                            {activity.type}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Links */}
            <Card>
                <CardHeader>
                    <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2 md:grid-cols-4">
                    <Link
                        href="/dashboard/products/new"
                        className="text-sm hover:bg-accent p-3 rounded-md border transition-colors"
                    >
                        + Agregar Producto
                    </Link>
                    <Link
                        href="/dashboard/purchases"
                        className="text-sm hover:bg-accent p-3 rounded-md border transition-colors"
                    >
                        + Nueva Orden de Compra
                    </Link>
                    <Link
                        href="/dashboard/deliveries"
                        className="text-sm hover:bg-accent p-3 rounded-md border transition-colors"
                    >
                        + Nueva Entrega
                    </Link>
                    <Link
                        href="/dashboard/reports"
                        className="text-sm hover:bg-accent p-3 rounded-md border transition-colors"
                    >
                        📊 Ver Reportes
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
