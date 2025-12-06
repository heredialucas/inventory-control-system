import { ProductForm } from "@/components/inventory/product-form";
import { inventoryService } from "@/services/inventory-service";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "inventory.edit")) {
        redirect("/dashboard/inventory");
    }

    const [product, categories] = await Promise.all([
        inventoryService.getProduct(id),
        inventoryService.getCategories()
    ]);

    if (!product) {
        return <div>Producto no encontrado</div>;
    }

    // Serialize Decimal to string/number if needed, but TypeScript interface in Form expects number|string
    // Prisma Decimal object might not be directly compatible with React props if passed as is
    // Usually we convert to string or number.
    // Let's pass it as number (toNumber() if available) or string.
    // Prisma decimals are objects in server, but if we pass across boundary?
    // Server Component -> Client Component props must be serializable.
    // Prisma Decimal is not serialization safe.

    const serializedProduct = {
        ...product,
        price: product.price.toString(),
        // Remove other non-serializable fields if any (Dates are fine usually if treated as strings or Date objects depending on Next.js version, usually Date is fine in SC props in latest Next)
        // Actually Date objects are serializable in SC props since recent versions.
    };

    return (
        <div className="container mx-auto py-6">
            <ProductForm categories={categories} initialData={serializedProduct} />
        </div>
    );
}
