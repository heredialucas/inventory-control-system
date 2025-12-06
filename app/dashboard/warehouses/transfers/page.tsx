import { getTransfers, getWarehouses } from "@/app/actions/warehouses";
import { TransferList } from "@/components/warehouses/transfer-list";
import { TransferForm } from "@/components/warehouses/transfer-form";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight } from "lucide-react";

export const metadata = {
    title: "Warehouse Transfers | Inventory Control",
    description: "Manage stock transfers between warehouses",
};

export default async function WarehouseTransfersPage() {
    const user = await getCurrentUser();
    const warehouses = await getWarehouses();
    const allTransfers = await getTransfers();

    const pendingTransfers = allTransfers.filter((t) => t.status === "PENDING");
    const inTransitTransfers = allTransfers.filter((t) => t.status === "IN_TRANSIT");
    const completedTransfers = allTransfers.filter((t) => t.status === "COMPLETED");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Warehouse Transfers</h1>
                    <p className="text-muted-foreground">
                        Manage stock movements between warehouse locations
                    </p>
                </div>
                <TransferForm
                    warehouses={warehouses}
                    userId={user!.id}
                    trigger={
                        <Button>
                            <ArrowRight className="mr-2 h-4 w-4" />
                            New Transfer
                        </Button>
                    }
                />
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList>
                    <TabsTrigger value="all">
                        All ({allTransfers.length})
                    </TabsTrigger>
                    <TabsTrigger value="pending">
                        Pending ({pendingTransfers.length})
                    </TabsTrigger>
                    <TabsTrigger value="in-transit">
                        In Transit ({inTransitTransfers.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                        Completed ({completedTransfers.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                    <TransferList transfers={allTransfers} userId={user!.id} />
                </TabsContent>

                <TabsContent value="pending" className="mt-6">
                    <TransferList transfers={pendingTransfers} userId={user!.id} />
                </TabsContent>

                <TabsContent value="in-transit" className="mt-6">
                    <TransferList transfers={inTransitTransfers} userId={user!.id} />
                </TabsContent>

                <TabsContent value="completed" className="mt-6">
                    <TransferList transfers={completedTransfers} userId={user!.id} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
