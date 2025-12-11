import { CategoryForm } from "@/components/categories/category-form";
import { inventoryService } from "@/services/inventory-service";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { UnauthorizedAccess } from "@/components/unauthorized-access";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default async function CategoriesPage() {
    const user = await getCurrentUser();

    if (!user || !hasPermission(user, "categories.view")) {
        return <UnauthorizedAccess action="ver" resource="categorías" />;
    }

    const categories = await inventoryService.getCategories();
    const canManage = hasPermission(user, "categories.manage");

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Categorías</h1>
                    <p className="text-muted-foreground">
                        Gestionar categorías de productos
                    </p>
                </div>
                {canManage && <CategoryForm />}
            </div>

            {categories.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No hay categorías registradas</h3>
                        <p className="text-sm text-muted-foreground">
                            Comienza creando tu primera categoría
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Vista de tabla para desktop */}
                    <div className="hidden md:block border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead className="text-right">Productos</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="font-medium">{category.name}</TableCell>
                                        <TableCell>{category.description || "-"}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="secondary">{category._count.products}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Vista de cards para móviles */}
                    <div className="md:hidden grid gap-4">
                        {categories.map((category) => (
                            <Card key={category.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{category.name}</CardTitle>
                                            {category.description && (
                                                <CardDescription className="mt-1">
                                                    {category.description}
                                                </CardDescription>
                                            )}
                                        </div>
                                        <Badge variant="secondary" className="ml-2">
                                            {category._count.products} productos
                                        </Badge>
                                    </div>
                                </CardHeader>
                                {category.description && (
                                    <CardContent className="pt-0">
                                        <p className="text-sm text-muted-foreground">
                                            {category.description}
                                        </p>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
