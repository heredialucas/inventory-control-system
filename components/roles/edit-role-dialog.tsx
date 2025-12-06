
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
import { updateRoleAction } from "@/app/actions/roles";
import { Pencil } from "lucide-react";

interface EditRoleDialogProps {
    role: any;
    permissions: any[];
}

export function EditRoleDialog({ role, permissions }: EditRoleDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(role.name);
    const [description, setDescription] = useState(role.description || "");
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (open) {
            setName(role.name);
            setDescription(role.description || "");
            // Pre-fill permissions
            const currentPerms = role.permissions.map((p: any) => p.permission.id);
            setSelectedPermissions(currentPerms);
            setError("");
        }
    }, [open, role]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const result = await updateRoleAction(role.id, { name, description, permissionIds: selectedPermissions });

        if (result.error) {
            setError(result.error);
        } else {
            setOpen(false);
        }
        setLoading(false);
    };

    const togglePermission = (id: string) => {
        setSelectedPermissions(prev =>
            prev.includes(id)
                ? prev.filter(p => p !== id)
                : [...prev, id]
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Editar Rol</DialogTitle>
                        <DialogDescription>
                            Modificar nombre, descripción y permisos del rol.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-role-name" className="text-right">
                                Nombre
                            </Label>
                            <Input
                                id="edit-role-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="col-span-3"
                                placeholder="Ej. Vendedor"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-role-desc" className="text-right">
                                Descripción
                            </Label>
                            <Input
                                id="edit-role-desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="col-span-3"
                                placeholder="Descripción del rol"
                            />
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            <Label className="text-right pt-2">Permisos</Label>
                            <div className="col-span-3 border rounded-md p-3 h-64 overflow-y-auto space-y-4">
                                {permissions.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">No hay permisos disponibles.</p>
                                ) : (
                                    // Group permissions by prefix (inventory, sales, etc)
                                    Object.entries(permissions.reduce<Record<string, any[]>>((acc, perm) => {
                                        const prefix = perm.action.split('.')[0];
                                        if (!acc[prefix]) acc[prefix] = [];
                                        acc[prefix].push(perm);
                                        return acc;
                                    }, {})).map(([prefix, perms]) => (
                                        <div key={prefix}>
                                            <h5 className="text-xs font-bold uppercase text-muted-foreground mb-2">{prefix}</h5>
                                            <div className="space-y-2">
                                                {perms.map(perm => (
                                                    <div key={perm.id} className="flex items-center justify-between space-x-2 bg-muted/40 p-2 rounded-sm">
                                                        <Label htmlFor={`edit-perm-${perm.id}`} className="text-sm font-normal cursor-pointer flex-1">
                                                            <span className="font-mono text-xs font-semibold mr-1">{perm.action}</span>
                                                            <br />
                                                            <span className="text-[10px] text-muted-foreground">{perm.description}</span>
                                                        </Label>
                                                        <Checkbox
                                                            id={`edit-perm-${perm.id}`}
                                                            checked={selectedPermissions.includes(perm.id)}
                                                            onCheckedChange={() => togglePermission(perm.id)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
