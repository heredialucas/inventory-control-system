import { getCurrentUser, hasPermission } from "@/lib/auth";
import { getTransfers, getWarehouses } from "@/app/actions/warehouses";
import { TransferList } from "@/components/warehouses/transfer-list";
import { TransferForm } from "@/components/warehouses/transfer-form";
import { UnauthorizedAccess } from "@/components/unauthorized-access";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight } from "lucide-react";

export const metadata = {
    title: "Transferencias de Depósitos | Control de Inventario",
    description: "Gestionar transferencias de stock entre depósitos",
};

export default async function WarehouseTransfersPage() {
    const user = await getCurrentUser();

    if (!user || !hasPermission(user, "transfers.view")) {
        return <UnauthorizedAccess action="ver" resource="transferencias entre depósitos" />;
    }

    const warehouses = await getWarehouses();
    const allTransfers = await getTransfers();

    const pendingTransfers = allTransfers.filter((t) => t.status === "PENDING");
    const inTransitTransfers = allTransfers.filter((t) => t.status === "IN_TRANSIT");
    const completedTransfers = allTransfers.filter((t) => t.status === "COMPLETED");
    const canManage = hasPermission(user, "transfers.manage");

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Transferencias de Depósitos</h1>
                    <p className="text-muted-foreground">
                        Gestionar movimientos de stock entre ubicaciones de depósitos
                    </p>
                </div>
                {canManage && (
                    <div className="flex justify-end">
                        <TransferForm
                            warehouses={warehouses}
                            userId={user!.id}
                            trigger={
                                <Button>
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    Nueva Transferencia
                                </Button>
                            }
                        />
                    </div>
                )}
            </div>

            <Tabs defaultValue="all" className="w-full">
                <div className="overflow-x-auto">
                    <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-max min-w-full sm:w-auto">
                        <TabsTrigger value="all" className="whitespace-nowrap">
                            <span className="hidden sm:inline">Todas ({allTransfers.length})</span>
                            <span className="sm:hidden">Todas ({allTransfers.length})</span>
                        </TabsTrigger>
                        <TabsTrigger value="pending" className="whitespace-nowrap">
                            <span className="hidden sm:inline">Pendientes ({pendingTransfers.length})</span>
                            <span className="sm:hidden">Pendientes ({pendingTransfers.length})</span>
                        </TabsTrigger>
                        <TabsTrigger value="in-transit" className="whitespace-nowrap">
                            <span className="hidden sm:inline">En Tránsito ({inTransitTransfers.length})</span>
                            <span className="sm:hidden">Tránsito ({inTransitTransfers.length})</span>
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="whitespace-nowrap">
                            <span className="hidden sm:inline">Completadas ({completedTransfers.length})</span>
                            <span className="sm:hidden">Completadas ({completedTransfers.length})</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="all" className="mt-6">
                    <TransferList transfers={allTransfers} userId={user!.id} canManage={canManage} />
                </TabsContent>

                <TabsContent value="pending" className="mt-6">
                    <TransferList transfers={pendingTransfers} userId={user!.id} canManage={canManage} />
                </TabsContent>

                <TabsContent value="in-transit" className="mt-6">
                    <TransferList transfers={inTransitTransfers} userId={user!.id} canManage={canManage} />
                </TabsContent>

                <TabsContent value="completed" className="mt-6">
                    <TransferList transfers={completedTransfers} userId={user!.id} canManage={canManage} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
