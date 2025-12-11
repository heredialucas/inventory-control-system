import { ProductForm } from "@/components/inventory/product-form";
import { inventoryService } from "@/services/inventory-service";
import { getWarehouses } from "@/app/actions/warehouses";
import { getSuppliers } from "@/app/actions/suppliers";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CreateProductPage() {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "inventory.manage")) {
        redirect("/dashboard/inventory"); // O página de error
    }

    const [categories, warehouses, suppliers] = await Promise.all([
        inventoryService.getCategories(),
        getWarehouses(),
        getSuppliers().catch(() => []), // Si falla, devolver array vacío
    ]);

    return (
        <div className="container mx-auto py-6">
            <ProductForm
                categories={categories}
                warehouses={warehouses}
                suppliers={suppliers}
            />
        </div>
    );
}
