import {
    getDashboardStats,
    getLowStockProducts,
    getRecentActivity,
} from "@/app/actions/analytics";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Panel de Control",
    description: "Vista general del sistema de inventario",
};

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

function getStatusVariant(status: string): BadgeVariant {
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
}

interface Activity {
    type: string;
    description: string;
    date: string | Date;
}

/** Componente extraído para evitar IIFEs en JSX */
function ActivityDescription({ activity }: { activity: Activity }) {
    if (activity.type === "movimiento") {
        const [prefix, rest] = activity.description.split(": ");
        return (
            <div className="flex items-center gap-2">
                <Badge
                    variant={
                        activity.description.startsWith("ENTRADA")
                            ? "default"
                            : "destructive"
                    }
                >
                    {prefix}
                </Badge>
                <p className="text-sm">{rest}</p>
            </div>
        );
    }

    if (activity.description.includes(" - ")) {
        const [desc, status] = activity.description.split(" - ");
        return (
            <div className="flex flex-col gap-1">
                <p className="text-sm">{desc}</p>
                <Badge variant={getStatusVariant(status)} className="w-fit">
                    {status}
                </Badge>
            </div>
        );
    }

    return <p className="text-sm">{activity.description}</p>;
}

export default async function DashboardPage() {
    // getCurrentUser usa React.cache(): no genera una segunda query a DB
    // porque ya fue llamado en el layout del dashboard
    const user = await getCurrentUser();

    // Usa función tipada en lugar de (ur: any)
    const isAdmin = isAdminUser(user);

    if (!user) {
        redirect("/auth/login");
    }

    if (!isAdmin) {
        redirect("/dashboard/users");
    }

    // Paralelizar las 3 fetches independientes con Promise.all
    // evita el waterfall (antes eran 3 awaits secuenciales)
    const [stats, lowStockProducts, recentActivity] = await Promise.all([
        getDashboardStats(),
        getLowStockProducts(),
        getRecentActivity(5),
    ]);

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
                        <Package className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalProducts}</div>
                        <Link
                            href="/dashboard/products"
                            className="text-xs text-muted-foreground hover:underline"
                        >
                            Ver todos los productos
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Almacenes</CardTitle>
                        <Warehouse className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalWarehouses}</div>
                        <Link
                            href="/dashboard/warehouses"
                            className="text-xs text-muted-foreground hover:underline"
                        >
                            Ver almacenes
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Proveedores</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalSuppliers}</div>
                        <Link
                            href="/dashboard/suppliers"
                            className="text-xs text-muted-foreground hover:underline"
                        >
                            Ver proveedores
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Instituciones</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalInstitutions}</div>
                        <Link
                            href="/dashboard/institutions"
                            className="text-xs text-muted-foreground hover:underline"
                        >
                            Ver instituciones
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Transferencias Pendientes
                        </CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingTransfers}</div>
                        <p className="text-xs text-muted-foreground">Esperando completarse</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Compras Pendientes</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingPurchases}</div>
                        <p className="text-xs text-muted-foreground">Esperando recepción</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Entregas Pendientes</CardTitle>
                        <ArrowDownRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingDeliveries}</div>
                        <p className="text-xs text-muted-foreground">Esperando entrega</p>
                    </CardContent>
                </Card>
            </div>

            {/* Low Stock Alert & Recent Activity */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle
                                className="h-5 w-5 text-yellow-500"
                                aria-hidden="true"
                            />
                            Alertas de Stock Bajo
                        </CardTitle>
                        <CardDescription>Productos que necesitan atención</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {lowStockProducts.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Todos los productos tienen stock adecuado
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {lowStockProducts.slice(0, 5).map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{product.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {product.category}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <Badge
                                                variant={
                                                    product.status === "out_of_stock"
                                                        ? "destructive"
                                                        : "secondary"
                                                }
                                            >
                                                {product.currentStock} unidades
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                {lowStockProducts.length > 5 && (
                                    // text-primary en vez de text-blue-600 hardcodeado
                                    <Link
                                        href="/dashboard/reports"
                                        className="text-sm text-primary hover:underline block text-center pt-2"
                                    >
                                        Ver todos los {lowStockProducts.length} productos con
                                        stock bajo
                                    </Link>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Actividad Reciente</CardTitle>
                        <CardDescription>Últimos eventos del sistema</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentActivity.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Sin actividad reciente
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {recentActivity.map((activity, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex-1 space-y-1">
                                            {/* ActivityDescription extrae la lógica de los IIFEs */}
                                            <ActivityDescription activity={activity} />
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(activity.date), {
                                                    addSuffix: true,
                                                    locale: es,
                                                })}
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
        </div>
    );
}
