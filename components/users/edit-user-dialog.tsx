
"use client";

import { useState, useEffect } from "react";
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
import { updateUserAction } from "@/app/actions/users";
import { Pencil } from "lucide-react";

interface EditUserDialogProps {
    user: any;
    roles: any[];
}

export function EditUserDialog({ user, roles }: EditUserDialogProps) {
    const [open, setOpen] = useState(false);
    const [firstName, setFirstName] = useState(user.firstName || "");
    const [lastName, setLastName] = useState(user.lastName || "");

    // Initialize selected roles from user's current roles
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const translateRoleName = (name: string) => {
        const translations: Record<string, string> = {
            ADMIN: "Administrador",
            MANAGER: "Encargado",
            VIEWER: "Empleado"
        };
        return translations[name] || name;
    };

    // Reset state when dialog opens or user changes
    useEffect(() => {
        if (open) {
            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
            setSelectedRoles(user.userRoles?.map((ur: any) => ur.role.id) || []);
            setError("");
        }
    }, [open, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const result = await updateUserAction(user.id, {
            firstName,
            lastName,
            roleIds: selectedRoles
        });

        if (result.error) {
            setError(result.error);
        } else {
            setOpen(false);
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

    // Allow assigning any role in Edit mode
    const availableRoles = roles;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Editar Usuario</DialogTitle>
                        <DialogDescription>
                            Modificar datos personales y roles asignados.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-4">
                            <Label className="sm:text-right">Email</Label>
                            <Input
                                value={user.email}
                                disabled
                                className="sm:col-span-3 bg-muted"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-4">
                            <Label htmlFor="edit-firstname" className="sm:text-right">
                                Nombre
                            </Label>
                            <Input
                                id="edit-firstname"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="sm:col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-4">
                            <Label htmlFor="edit-lastname" className="sm:text-right">
                                Apellido
                            </Label>
                            <Input
                                id="edit-lastname"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="sm:col-span-3"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <Label className="sm:text-right sm:pt-2">Roles</Label>
                            <div className="sm:col-span-3 border rounded-md p-3 h-48 overflow-y-auto space-y-2">
                                {availableRoles.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">No hay roles disponibles.</p>
                                ) : (
                                    availableRoles.map(role => (
                                        <div key={role.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`edit-role-${role.id}`}
                                                checked={selectedRoles.includes(role.id)}
                                                onCheckedChange={() => toggleRole(role.id)}
                                            />
                                            <Label htmlFor={`edit-role-${role.id}`} className="text-sm font-normal cursor-pointer leading-none">
                                                <span className="font-semibold mr-1">{translateRoleName(role.name)}</span>
                                            </Label>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
