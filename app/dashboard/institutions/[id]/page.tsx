import { notFound, redirect } from "next/navigation";
import { getInstitution, toggleInstitutionStatus, deleteInstitution } from "@/app/actions/institutions";
import { getCurrentUser } from "@/lib/auth";
import { InstitutionForm } from "@/components/institutions/institution-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trash2, Power, History, Settings } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const getDeliveryStatusLabel = (status: string) => {
    switch (status) {
        case "DELIVERED":
            return "Entregado";
        case "CANCELLED":
            return "Cancelado";
        case "PENDING":
            return "Pendiente";
        case "IN_TRANSIT":
            return "En Tránsito";
        default:
            return status;
    }
};

/* Next.js 15: params is a Promise */
export default async function InstitutionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const institution = await getInstitution(id);
    const user = await getCurrentUser();

    if (!institution) {
        notFound();
    }

    if (!user) redirect("/login");

    async function toggleStatus() {
        "use server";
        await toggleInstitutionStatus(id);
        redirect(`/dashboard/institutions/${id}`);
    }

    async function removeInstitution() {
        "use server";
        await deleteInstitution(id);
        redirect("/dashboard/institutions");
    }

    // Convert Decimals if any (though Institution model seems to be mostly strings, 
    // deliveries items might contain decimals. Safer to serialize if passing complex objects).
    // The InstitutionForm only takes flat data so simple prop passing is fine for the form.
    // For the delivery table, we need to be careful if we pass full objects.

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-3xl font-bold tracking-tight">{institution.name}</h1>
                        <Badge variant="outline">{institution.code}</Badge>
                        <Badge variant={institution.isActive ? "default" : "secondary"}>
                            {institution.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <form action={toggleStatus}>
                        <Button variant="outline" size="sm">
                            <Power className="mr-2 h-4 w-4" />
                            {institution.isActive ? "Desactivar" : "Activar"}
                        </Button>
                    </form>
                    {institution._count.deliveries === 0 && (
                        <form action={removeInstitution}>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                            </Button>
                        </form>
                    )}
                </div>
            </div>

            <Tabs defaultValue="details" className="w-full">
                <TabsList>
                    <TabsTrigger value="details">Detalles</TabsTrigger>
                    <TabsTrigger value="history">Historial de Entregas</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-6">
                    <InstitutionForm initialData={institution} isEdit />
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Entregas Recientes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {institution.deliveries.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">No se encontraron entregas para esta institución.</p>
                            ) : (
                                <>
                                    {/* Mobile Cards */}
                                    <div className="block md:hidden space-y-4">
                                        {institution.deliveries.map((delivery) => (
                                            <Card key={delivery.id}>
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="space-y-1">
                                                            <div className="font-medium">{format(new Date(delivery.createdAt), "PPP", { locale: es })}</div>
                                                            <div className="text-sm text-muted-foreground">{delivery.warehouse.name}</div>
                                                        </div>
                                                        <Badge variant={delivery.status === "DELIVERED" ? "default" : "secondary"}>
                                                            {getDeliveryStatusLabel(delivery.status)}
                                                        </Badge>
                                                    </div>
                                                    <div className="mt-4 flex items-center justify-between text-sm">
                                                        <div>
                                                            <Badge variant="secondary">{delivery._count.items} artículos</Badge>
                                                        </div>
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/dashboard/deliveries/${delivery.id}`}>
                                                                Ver
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    {/* Desktop Table */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Fecha</TableHead>
                                                    <TableHead>Almacén</TableHead>
                                                    <TableHead>Artículos</TableHead>
                                                    <TableHead>Estado</TableHead>
                                                    <TableHead>Acción</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {institution.deliveries.map((delivery) => (
                                                    <TableRow key={delivery.id}>
                                                        <TableCell>
                                                            {format(new Date(delivery.createdAt), "PPP", { locale: es })}
                                                        </TableCell>
                                                        <TableCell>{delivery.warehouse.name}</TableCell>
                                                        <TableCell>{delivery._count.items}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={delivery.status === "DELIVERED" ? "default" : "secondary"}>
                                                                {getDeliveryStatusLabel(delivery.status)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link href={`/dashboard/deliveries/${delivery.id}`}>
                                                                    Ver
                                                                </Link>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
