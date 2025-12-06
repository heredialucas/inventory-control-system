
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock } from "lucide-react";

export function UserProfileView({ user }: { user: any }) {
    // Extract unique permissions from all roles
    const allPermissions = Array.from(
        new Set(
            user.userRoles?.flatMap((ur: any) =>
                ur.role.permissions.map((rp: any) => rp.permission.description)
            ) || []
        )
    );

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="space-y-1">
                <h3 className="text-2xl font-semibold tracking-tight">Mi Perfil</h3>
                <p className="text-sm text-muted-foreground">
                    Información de tu cuenta y accesos.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Datos Personales</CardTitle>
                    <CardDescription>Información básica de tu usuario.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground">Nombre Completo</span>
                            <p>{user.firstName} {user.lastName}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground">Email</span>
                            <p>{user.email}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Roles Asignados
                    </CardTitle>
                    <CardDescription>
                        Roles que determinan tu nivel de acceso en el sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {user.userRoles && user.userRoles.length > 0 ? (
                            user.userRoles.map((ur: any) => (
                                <Badge key={ur.role.id} variant="default" className="text-md py-1">
                                    {ur.role.name}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-muted-foreground">Sin roles asignados</span>
                        )}
                    </div>
                    {user.userRoles && user.userRoles.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {user.userRoles.map((ur: any) => (
                                <div key={ur.role.id} className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                                    <span className="font-semibold text-foreground">{ur.role.name}:</span> {ur.role.description}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Permisos Efectivos
                    </CardTitle>
                    <CardDescription>
                        Lista completa de acciones que puedes realizar.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {allPermissions.length > 0 ? (
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {allPermissions.map((desc: any, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    {desc}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-sm">No tienes permisos asignados.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
