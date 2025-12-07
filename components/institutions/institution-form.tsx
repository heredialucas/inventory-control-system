"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { createInstitution, updateInstitution } from "@/app/actions/institutions";
import Link from "next/link";

interface InstitutionFormProps {
    initialData?: any;
    isEdit?: boolean;
}

const INSTITUTION_TYPES = [
    "Nivel Inicial",
    "Nivel Primario",
    "Nivel Secundario",
    "Escuela Técnica",
    "Escuela Especial",
    "Centro de Formación Profesional",
    "Otro"
];

export function InstitutionForm({ initialData, isEdit = false }: InstitutionFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        code: initialData?.code || "",
        type: initialData?.type || "Nivel Primario",
        contactName: initialData?.contactName || "",
        email: initialData?.email || "",
        phone: initialData?.phone || "",
        address: initialData?.address || "",
        notes: initialData?.notes || "",
    });

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.code) {
            toast.error("El nombre y el código (CUE) son requeridos");
            return;
        }

        startTransition(async () => {
            try {
                if (isEdit) {
                    await updateInstitution(initialData.id, formData);
                    toast.success("Escuela actualizada correctamente");
                } else {
                    await createInstitution(formData);
                    toast.success("Escuela creada correctamente");
                }
                router.push("/dashboard/institutions");
            } catch (error: any) {
                toast.error(error.message || "Error al guardar escuela");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="maximum-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/institutions">
                    <Button variant="ghost" size="icon" type="button">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">{isEdit ? "Editar Escuela" : "Nueva Escuela"}</h1>
                    <p className="text-muted-foreground text-sm">
                        {isEdit ? "Actualizar detalles de la escuela" : "Registrar una nueva escuela"}
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Detalles de la Escuela</CardTitle>
                    <CardDescription>Información básica de la institución educativa</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">CUE / Código</Label>
                            <Input
                                id="code"
                                placeholder="12345678"
                                value={formData.code}
                                onChange={(e) => handleChange("code", e.target.value)}
                                disabled={isEdit} // Often code shouldn't be changed
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Nivel / Tipo</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => handleChange("type", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar nivel" />
                                </SelectTrigger>
                                <SelectContent>
                                    {INSTITUTION_TYPES.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre de la Escuela</Label>
                        <Input
                            id="name"
                            placeholder="Escuela Normal N°1"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Dirección</Label>
                        <Textarea
                            id="address"
                            placeholder="Calle Falsa 123..."
                            value={formData.address}
                            onChange={(e) => handleChange("address", e.target.value)}
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Información de Contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="contactName">Nombre de Contacto / Director</Label>
                        <Input
                            id="contactName"
                            placeholder="Juan Pérez"
                            value={formData.contactName}
                            onChange={(e) => handleChange("contactName", e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="contacto@escuela.edu"
                                value={formData.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input
                                id="phone"
                                placeholder="+54 9 11 ..."
                                value={formData.phone}
                                onChange={(e) => handleChange("phone", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notas Adicionales</Label>
                        <Textarea
                            id="notes"
                            placeholder="Notas internas..."
                            value={formData.notes}
                            onChange={(e) => handleChange("notes", e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                {isEdit ? "Actualizar Escuela" : "Crear Escuela"}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
