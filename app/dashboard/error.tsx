"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Error en el dashboard:", error);
    }, [error]);

    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 p-8 text-center">
            <div className="flex items-center justify-center size-16 rounded-full bg-destructive/10">
                <AlertTriangle className="size-8 text-destructive" />
            </div>
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight">
                    Error en el Dashboard
                </h2>
                <p className="text-muted-foreground text-sm max-w-sm">
                    No se pudieron cargar los datos. Verificá tu conexión e intentá de nuevo.
                    {error.digest && (
                        <span className="block mt-1 font-mono text-xs opacity-60">
                            ID: {error.digest}
                        </span>
                    )}
                </p>
            </div>
            <Button onClick={reset} variant="outline" className="gap-2">
                <RefreshCw className="size-4" />
                Intentar de nuevo
            </Button>
        </div>
    );
}
