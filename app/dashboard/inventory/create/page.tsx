import { ProductForm } from "@/components/inventory/product-form";
import { inventoryService } from "@/services/inventory-service";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CreateProductPage() {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "inventory.create")) {
        redirect("/dashboard/inventory"); // Or error page
    }

    const categories = await inventoryService.getCategories();

    return (
        <div className="container mx-auto py-6">
            <ProductForm categories={categories} />
        </div>
    );
}
