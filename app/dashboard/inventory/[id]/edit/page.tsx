import { ProductForm } from "@/components/inventory/product-form";
import { inventoryService } from "@/services/inventory-service";
import { getWarehouses } from "@/app/actions/warehouses";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "inventory.manage")) {
        redirect("/dashboard/inventory");
    }

    const [product, categories, warehouses] = await Promise.all([
        inventoryService.getProduct(id),
        inventoryService.getCategories(),
        getWarehouses(),
    ]);

    if (!product) {
        return <div>Producto no encontrado</div>;
    }

    // Serializar Decimal a string para el componente del cliente
    const serializedProduct = {
        ...product,
        price: product.price.toString(),
        purchaseDate: product.purchaseDate ? product.purchaseDate.toISOString().split('T')[0] : null,
        purchaseAmount: product.purchaseAmount ? product.purchaseAmount.toString() : null,
    };

    return (
        <div className="container mx-auto py-6">
            <ProductForm
                categories={categories}
                warehouses={warehouses}
                initialData={serializedProduct}
            />
        </div>
    );
}
