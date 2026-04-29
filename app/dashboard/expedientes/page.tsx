import { getCurrentUser, hasPermission } from "@/lib/auth";
import { getExpedientes } from "@/app/actions/expedientes";
import { UnauthorizedAccess } from "@/components/unauthorized-access";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { ExpedienteList } from "@/components/expedientes/expediente-list";

export const metadata = {
    title: "Expedientes | Control de Inventario",
    description: "Gestión de Expedientes",
};

export default async function ExpedientesPage() {
    const user = await getCurrentUser();

    if (!user || !hasPermission(user, "expedientes.view")) {
        return <UnauthorizedAccess action="ver" resource="expedientes" />;
    }

    const expedientes = await getExpedientes();
    const canManage = hasPermission(user, "expedientes.manage");

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Expedientes</h1>
                    <p className="text-muted-foreground">
                        Gestionar el ciclo de vida de las compras y distribución
                    </p>
                </div>
                {canManage && (
                    <div className="flex justify-end">
                        <Link href="/dashboard/expedientes/new">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Nuevo Expediente
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            <ExpedienteList expedientes={expedientes} canManage={canManage} />
        </div>
    );
}
