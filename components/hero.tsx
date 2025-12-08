import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function Hero() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-8 md:gap-12 lg:gap-16 items-center">
      <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-center mx-auto max-w-4xl">DIRECCIÓN DE MATERIALES Y CONSTRUCCIONES ESCOLARES</h1>
      <p className="text-lg md:text-xl lg:text-2xl text-center mx-auto max-w-xl">
        Sistema de Gestión de Control de Stock
      </p>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
      {user && (
        <Button asChild size="lg" className="text-lg px-8 py-3">
          <Link href="/dashboard">
            Ir al Dashboard
          </Link>
        </Button>
      )}
    </div>
  );
}
