import Link from "next/link";
import { Button } from "./ui/button";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const user = await getCurrentUser();

  return user ? (
    <div className="flex items-center gap-4">
      ¡Hola, {user.email}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Iniciar sesión</Link>
      </Button>
      {/* <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Registrarse</Link>
      </Button> */}
    </div>
  );
}
