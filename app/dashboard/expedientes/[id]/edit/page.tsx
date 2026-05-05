import { getCurrentUser, hasPermission } from "@/lib/auth";
import { getExpedienteCategories, getExpediente } from "@/app/actions/expedientes";
import { ExpedienteForm } from "@/components/expedientes/expediente-form";
import { UnauthorizedAccess } from "@/components/unauthorized-access";
import { notFound, redirect } from "next/navigation";

export const metadata = {
    title: "Editar Expediente | Control de Inventario",
    description: "Modificar un expediente existente",
};

interface EditExpedientePageProps {
    params: Promise<{ id: string }>;
}

export default async function EditExpedientePage({ params }: EditExpedientePageProps) {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) redirect("/login");

    if (!hasPermission(user, "expedientes.manage")) {
        return <UnauthorizedAccess action="editar" resource="expedientes" />;
    }

    const [expediente, categories] = await Promise.all([
        getExpediente(id),
        getExpedienteCategories()
    ]);

    if (!expediente) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <ExpedienteForm userId={user.id} expediente={expediente} categories={categories} />
        </div>
    );
}
