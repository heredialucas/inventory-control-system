import Link from "next/link";
import { Button } from "./ui/button";
import { getCurrentUser } from "@/lib/auth";
import { UserNav } from "./user-nav";

export async function AuthButton() {
  const user = await getCurrentUser();

  return user ? (
    <UserNav user={{ 
      username: user.username || user.firstName || user.email.split('@')[0], 
      email: user.email 
    }} />
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Iniciar sesión</Link>
      </Button>
    </div>
  );
}
