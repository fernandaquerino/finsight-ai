import Link from "next/link";
import type { Metadata } from "next";

import { Logo } from "@/components/app/Icons";
import { buttonVariants } from "@/components/ui/Button";
import { appRoutes } from "@/routes/app-routes";

export const metadata: Metadata = {
  title: "Página não encontrada — FinSight AI",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <Link href={appRoutes.dashboard} aria-label="Ir para o Dashboard">
        <Logo className="h-8 w-auto" />
      </Link>

      <div className="flex flex-col items-center gap-4">
        <div
          className="flex size-20 items-center justify-center rounded-2xl bg-primary-soft text-primary"
          aria-hidden="true"
        >
          <span className="font-mono text-3xl font-bold tracking-tight">
            404
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">
            Página não encontrada
          </h1>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            O endereço que você tentou acessar não existe ou foi movido.
            Verifique o link ou volte para o início.
          </p>
        </div>
      </div>

      <Link href={appRoutes.dashboard} className={buttonVariants()}>
        Voltar para o Dashboard
      </Link>
    </main>
  );
}
