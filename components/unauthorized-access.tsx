import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface UnauthorizedAccessProps {
    action?: string;
    resource?: string;
}

export function UnauthorizedAccess({ action = "acceder a", resource = "este recurso" }: UnauthorizedAccessProps) {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-destructive/10 p-3">
                            <ShieldAlert className="h-10 w-10 text-destructive" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Acceso Denegado</CardTitle>
                    <CardDescription>
                        No tienes permisos para {action} {resource}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                        Si crees que deberías tener acceso a esta sección, por favor contacta al administrador del sistema para solicitar los permisos necesarios.
                    </p>
                    <div className="flex gap-2">
                        <Button asChild variant="outline" className="flex-1">
                            <Link href="/dashboard">
                                Volver al Dashboard
                            </Link>
                        </Button>
                        <Button asChild className="flex-1">
                            <Link href="/dashboard/users">
                                Contactar Admin
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
