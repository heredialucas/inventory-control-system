import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
            <div className="flex items-center justify-center size-20 rounded-full bg-muted">
                <FileQuestion className="size-10 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold tracking-tight">404</h1>
                <h2 className="text-xl font-semibold">Página no encontrada</h2>
                <p className="text-muted-foreground text-sm max-w-sm">
                    La página que buscás no existe o fue movida a otra ubicación.
                </p>
            </div>
            <Button asChild>
                <Link href="/dashboard">Volver al inicio</Link>
            </Button>
        </div>
    );
}
