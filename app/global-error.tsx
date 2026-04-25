"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Error global:", error);
    }, [error]);

    return (
        <html lang="es">
            <body className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-6 p-8 text-center max-w-md">
                    <div className="flex items-center justify-center size-16 rounded-full bg-destructive/10">
                        <AlertTriangle className="size-8 text-destructive" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Algo salió mal
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Ocurrió un error inesperado en la aplicación.
                            {error.digest && (
                                <span className="block mt-1 font-mono text-xs opacity-60">
                                    ID: {error.digest}
                                </span>
                            )}
                        </p>
                    </div>
                    <Button onClick={reset} variant="default">
                        Intentar de nuevo
                    </Button>
                </div>
            </body>
        </html>
    );
}
