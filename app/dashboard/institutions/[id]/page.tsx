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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{institution.name}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{institution.code}</Badge>
                        <Badge variant={institution.isActive ? "default" : "secondary"}>
                            {institution.isActive ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                </div>
                <div className="flex gap-2">
                    <form action={toggleStatus}>
                        <Button variant="outline" size="sm">
                            <Power className="mr-2 h-4 w-4" />
                            {institution.isActive ? "Deactivate" : "Activate"}
                        </Button>
                    </form>
                    {institution._count.deliveries === 0 && (
                        <form action={removeInstitution}>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </form>
                    )}
                </div>
            </div>

            <Tabs defaultValue="details" className="w-full">
                <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="history">Delivery History</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-6">
                    <InstitutionForm initialData={institution} isEdit />
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Deliveries</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {institution.deliveries.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">No deliveries found for this institution.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Warehouse</TableHead>
                                            <TableHead>Items</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {institution.deliveries.map((delivery) => (
                                            <TableRow key={delivery.id}>
                                                <TableCell>
                                                    {format(new Date(delivery.createdAt), "PPP")}
                                                </TableCell>
                                                <TableCell>{delivery.warehouse.name}</TableCell>
                                                <TableCell>{delivery._count.items}</TableCell>
                                                <TableCell>
                                                    <Badge variant={delivery.status === "DELIVERED" ? "default" : "secondary"}>
                                                        {delivery.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/dashboard/deliveries/${delivery.id}`}>
                                                            View
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
