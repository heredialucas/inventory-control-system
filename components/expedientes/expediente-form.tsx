"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { createExpediente } from "@/app/actions/expedientes";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ExpedienteForm({ userId }: { userId: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [number, setNumber] = useState("");
    const [year, setYear] = useState(new Date().getFullYear());
    const [type, setType] = useState("COMPRA");
    const [origin, setOrigin] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("ABIERTO");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        startTransition(async () => {
            try {
                await createExpediente({
                    number: number || undefined,
                    year,
                    type,
                    origin,
                    description,
                    status
                });
                toast.success("Expediente creado correctamente");
                router.push("/dashboard/expedientes");
                router.refresh();
            } catch (error: any) {
                toast.error(error.message || "Error al crear expediente");
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
                    <h1 className="text-2xl font-bold">Nuevo Expediente</h1>
                    <p className="text-muted-foreground text-sm">
                        Crear un nuevo expediente para centralizar compras y entregas.
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
                                Creando Expediente...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Guardar Expediente
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
