import { getCurrentUser, hasPermission } from "@/lib/auth";
import { getInstitutions } from "@/app/actions/institutions";
import { UnauthorizedAccess } from "@/components/unauthorized-access";
import { InstitutionList } from "@/components/institutions/institution-list";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Instituciones | Control de Inventario",
    description: "Gestionar instituciones y entregas",
};

export default async function InstitutionsPage() {
    const user = await getCurrentUser();

    if (!user || !hasPermission(user, "institutions.view")) {
        return <UnauthorizedAccess action="ver" resource="instituciones" />;
    }

    const institutions = await getInstitutions();
    const canManage = hasPermission(user, "institutions.manage");

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Escuelas</h1>
                    <p className="text-muted-foreground text-sm">
                        Gestión de establecimientos educativos
                    </p>
                </div>
                {canManage && (
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/dashboard/institutions/new">
                            <Building2 className="mr-2 h-4 w-4" />
                            <span className="sm:hidden">Nueva</span>
                            <span className="hidden sm:inline">Nueva Escuela</span>
                        </Link>
                    </Button>
                )}
            </div>

            <InstitutionList institutions={institutions} canManage={canManage} />
        </div>
    );
}
