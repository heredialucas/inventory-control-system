import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
    const user = await getCurrentUser();

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold">Panel de Control</h1>
            <p className="text-muted-foreground">
                Bienvenido al sistema de gestión, {user?.email}.
            </p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Placeholder cards */}
                <div className="p-6 border rounded-lg shadow-sm bg-card">
                    <h3 className="font-semibold mb-2">Inventario</h3>
                    <p className="text-sm text-muted-foreground">Gestionar productos y stock.</p>
                </div>
                <div className="p-6 border rounded-lg shadow-sm bg-card">
                    <h3 className="font-semibold mb-2">Ventas</h3>
                    <p className="text-sm text-muted-foreground">Registrar y ver ventas.</p>
                </div>
                <div className="p-6 border rounded-lg shadow-sm bg-card">
                    <h3 className="font-semibold mb-2">Usuarios</h3>
                    <p className="text-sm text-muted-foreground">Administrar usuarios del sistema.</p>
                </div>
            </div>
        </div>
    );
}
