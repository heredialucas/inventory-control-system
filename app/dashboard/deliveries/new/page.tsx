import { getCurrentUser } from "@/lib/auth";
import { getInstitutions } from "@/app/actions/institutions";
import { getWarehouses } from "@/app/actions/warehouses";
import { DeliveryForm } from "@/components/deliveries/delivery-form";
import { redirect } from "next/navigation";

export default async function NewDeliveryPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const [schools, warehouses] = await Promise.all([
        getInstitutions(),
        getWarehouses(),
    ]);

    // Show only active ones? Usually yes.
    const activeSchools = schools.filter(s => s.isActive);
    const activeWarehouses = warehouses.filter(w => w.isActive);

    return (
        <div className="space-y-6">
            <DeliveryForm
                schools={activeSchools}
                warehouses={activeWarehouses}
                userId={user.id}
            />
        </div>
    );
}
