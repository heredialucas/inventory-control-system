"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Save, Loader2, ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import { createExpediente, updateExpediente, createExpedienteCategory } from "@/app/actions/expedientes";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExpedienteFormProps {
    userId: string;
    expediente?: any;
    categories?: Category[];
}

interface Category {
    id: string;
    name: string;
}

export function ExpedienteForm({ userId, expediente, categories = [] }: ExpedienteFormProps) {
    const isEditing = !!expediente;
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [number, setNumber] = useState(expediente?.number || "");
    const [year, setYear] = useState(expediente?.year || new Date().getFullYear());
    const [type, setType] = useState(expediente?.type || "COMPRA");
    const [origin, setOrigin] = useState(expediente?.origin || "");
    const [description, setDescription] = useState(expediente?.description || "");
    const [status, setStatus] = useState(expediente?.status || "ABIERTO");
    const [categoryId, setCategoryId] = useState(expediente?.categoryId || "");
    const [newCategoryName, setNewCategoryName] = useState("");
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [localCategories, setLocalCategories] = useState<Category[]>(categories);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        setIsCreatingCategory(true);
        try {
            const newCat = await createExpedienteCategory({ name: newCategoryName });
            setLocalCategories([...localCategories, newCat]);
            setCategoryId(newCat.id);
            setNewCategoryName("");
            setShowCategoryForm(false);
            toast.success("Categoría creada correctamente");
        } catch (error: any) {
            toast.error(error.message || "Error al crear categoría");
        } finally {
            setIsCreatingCategory(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        startTransition(async () => {
            try {
                if (isEditing) {
                    await updateExpediente(expediente.id, {
                        number,
                        year,
                        type,
                        origin,
                        description,
                        status,
                        categoryId: categoryId === "none" ? undefined : categoryId || undefined
                    });
                    toast.success("Expediente actualizado correctamente");
                } else {
                    await createExpediente({
                        number: number || undefined,
                        year,
                        type,
                        origin,
                        description,
                        status,
                        categoryId: categoryId === "none" ? undefined : categoryId || undefined
                    });
                    toast.success("Expediente creado correctamente");
                }
                router.push("/dashboard/expedientes");
                router.refresh();
            } catch (error: any) {
                toast.error(error.message || `Error al ${isEditing ? 'actualizar' : 'crear'} expediente`);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/expedientes">
                    <Button variant="ghost" size="icon" type="button">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">{isEditing ? 'Editar Expediente' : 'Nuevo Expediente'}</h1>
                    <p className="text-muted-foreground text-sm">
                        {isEditing 
                            ? 'Modificar los detalles del expediente seleccionado.' 
                            : 'Crear un nuevo expediente para centralizar compras y entregas.'}
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Identificación del Expediente</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="number">Número de Expediente</Label>
                        <Input
                            id="number"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            placeholder="Ej: 123-A-2024 (Auto si se deja vacío)"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="year">Año</Label>
                        <Input
                            id="year"
                            type="number"
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Tipo de Expediente</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="COMPRA">Compra</SelectItem>
                                <SelectItem value="LICITACION">Licitación</SelectItem>
                                <SelectItem value="CONTRATACION">Contratación Directa</SelectItem>
                                <SelectItem value="DONACION">Donación</SelectItem>
                                <SelectItem value="OTROS">Otros</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="category">Categoría</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowCategoryForm(!showCategoryForm)}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Nueva
                            </Button>
                        </div>
                        {showCategoryForm ? (
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Nombre de la categoría..."
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                />
                                <Button
                                    size="sm"
                                    onClick={handleCreateCategory}
                                    disabled={isCreatingCategory || !newCategoryName.trim()}
                                >
                                    {isCreatingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear"}
                                </Button>
                            </div>
                        ) : (
                            <Select value={categoryId} onValueChange={setCategoryId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Sin categoría</SelectItem>
                                    {localCategories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">Estado Inicial</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ABIERTO">Abierto</SelectItem>
                                <SelectItem value="CERRADO">Cerrado</SelectItem>
                                <SelectItem value="CANCELADO">Cancelado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Detalles y Origen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="origin">Área / Origen</Label>
                        <Input
                            id="origin"
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value)}
                            placeholder="Ej: Secretaría de Salud, Dirección de Compras..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción / Motivo</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Ej: Provisión de alimentos para el mes de Mayo..."
                            rows={4}
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/50 pt-6">
                    <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isEditing ? 'Actualizando...' : 'Creando...'}
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                {isEditing ? 'Guardar Cambios' : 'Guardar Expediente'}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
