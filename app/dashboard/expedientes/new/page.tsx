import { getCurrentUser, hasPermission } from "@/lib/auth";
import { getExpedienteCategories } from "@/app/actions/expedientes";
import { ExpedienteForm } from "@/components/expedientes/expediente-form";
import { UnauthorizedAccess } from "@/components/unauthorized-access";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Nuevo Expediente | Control de Inventario",
    description: "Crear un nuevo expediente",
};

export default async function NewExpedientePage() {
    const user = await getCurrentUser();

    if (!user) redirect("/login");

    if (!hasPermission(user, "expedientes.manage")) {
        return <UnauthorizedAccess action="crear" resource="expedientes" />;
    }

    const categories = await getExpedienteCategories();

    return (
        <div className="space-y-6">
            <ExpedienteForm userId={user.id} categories={categories} />
        </div>
    );
}
