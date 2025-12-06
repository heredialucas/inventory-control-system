import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-10 md:gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-2 px-3 md:p-3 md:px-5 text-sm">
            <Suspense>
              <AuthButton />
            </Suspense>
            <ThemeSwitcher />
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-10 md:gap-20 max-w-5xl p-3 md:p-5">
          <Hero />
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs py-8 md:py-16">
          <p>
            Desarrollado por{" "}
            <a
              href="https://blogui.me/heredialucas"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Heredia Lucas
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
