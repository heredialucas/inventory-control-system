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

export const metadata = {
    title: "Dashboard | Inventory Control",
    description: "Overview of inventory system",
};

export default async function DashboardPage() {
    const stats = await getDashboardStats();
    const lowStockProducts = await getLowStockProducts();
    const recentActivity = await getRecentActivity(5);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Overview of your inventory system
                </p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalProducts}</div>
                        <Link href="/dashboard/products" className="text-xs text-muted-foreground hover:underline">
                            View all products
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Warehouses</CardTitle>
                        <Warehouse className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalWarehouses}</div>
                        <Link href="/dashboard/warehouses" className="text-xs text-muted-foreground hover:underline">
                            View warehouses
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalSuppliers}</div>
                        <Link href="/dashboard/suppliers" className="text-xs text-muted-foreground hover:underline">
                            View suppliers
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Institutions</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalInstitutions}</div>
                        <Link href="/dashboard/institutions" className="text-xs text-muted-foreground hover:underline">
                            View institutions
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Transfers</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingTransfers}</div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting completion
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Purchases</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingPurchases}</div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting receipt
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Deliveries</CardTitle>
                        <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingDeliveries}</div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting delivery
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
                            Low Stock Alerts
                        </CardTitle>
                        <CardDescription>
                            Products that need attention
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {lowStockProducts.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                All products have adequate stock
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
                                                {product.currentStock} units
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                {lowStockProducts.length > 5 && (
                                    <Link href="/dashboard/reports" className="text-sm text-blue-600 hover:underline block text-center pt-2">
                                        View all {lowStockProducts.length} low stock products
                                    </Link>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Latest system events
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentActivity.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No recent activity
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {recentActivity.map((activity, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <Badge variant="outline" className="mt-0.5">
                                            {activity.type}
                                        </Badge>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm">{activity.description}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                                            </p>
                                        </div>
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
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2 md:grid-cols-4">
                    <Link
                        href="/dashboard/products/new"
                        className="text-sm hover:bg-accent p-3 rounded-md border transition-colors"
                    >
                        + Add Product
                    </Link>
                    <Link
                        href="/dashboard/purchases"
                        className="text-sm hover:bg-accent p-3 rounded-md border transition-colors"
                    >
                        + New Purchase Order
                    </Link>
                    <Link
                        href="/dashboard/deliveries"
                        className="text-sm hover:bg-accent p-3 rounded-md border transition-colors"
                    >
                        + New Delivery
                    </Link>
                    <Link
                        href="/dashboard/reports"
                        className="text-sm hover:bg-accent p-3 rounded-md border transition-colors"
                    >
                        📊 View Reports
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
