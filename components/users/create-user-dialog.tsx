"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createUserAction } from "@/app/actions/users";
import { UserPlus } from "lucide-react";

export function CreateUserDialog({ roles = [] }: { roles?: any[] }) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState(""); // Optional, default is 123456
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const result = await createUserAction({
            email,
            firstName,
            lastName,
            password: password || undefined,
            roleIds: selectedRoles
        });

        if (result.error) {
            setError(result.error);
        } else {
            setOpen(false);
            setEmail("");
            setFirstName("");
            setLastName("");
            setPassword("");
            setSelectedRoles([]);
        }
        setLoading(false);
    };

    const toggleRole = (id: string) => {
        setSelectedRoles(prev =>
            prev.includes(id)
                ? prev.filter(r => r !== id)
                : [...prev, id]
        );
    }

    // We DO NOT allow creating Admins explicitly as requested
    const availableRoles = roles.filter(role => role.name !== "Administrador");
    // const availableRoles = roles;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Nuevo Usuario
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                        <DialogDescription>
                            Crea un nuevo usuario y asígnale roles. Contraseña por defecto: 123456
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="col-span-3"
                                placeholder="correo@ejemplo.com"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="firstname" className="text-right">
                                Nombre
                            </Label>
                            <Input
                                id="firstname"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="col-span-3"
                                placeholder="Juan"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lastname" className="text-right">
                                Apellido
                            </Label>
                            <Input
                                id="lastname"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="col-span-3"
                                placeholder="Perez"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">
                                Contraseña
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="col-span-3"
                                placeholder="Opcional (def: 123456)"
                            />
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            <Label className="text-right pt-2">Roles</Label>
                            <div className="col-span-3 border rounded-md p-3 h-48 overflow-y-auto space-y-2">
                                {availableRoles.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">No hay roles disponibles.</p>
                                ) : (
                                    availableRoles.map(role => (
                                        <div key={role.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`role-${role.id}`}
                                                checked={selectedRoles.includes(role.id)}
                                                onCheckedChange={() => toggleRole(role.id)}
                                            />
                                            <Label htmlFor={`role-${role.id}`} className="text-sm font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                <span className="font-semibold mr-1">{role.name}</span>
                                            </Label>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creando..." : "Crear Usuario"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
