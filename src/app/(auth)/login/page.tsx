import {
  ActivityIcon,
  LandmarkIcon,
  LockKeyholeIcon,
  SparklesIcon,
  TargetIcon,
} from "lucide-react";

import { Button } from "@/components/ui/Button";

import { signInWithGitHub, signInWithGoogle } from "./actions";
import { CredentialsLoginForm } from "./CredentialsLoginForm";

type LoginPageProps = Readonly<{
  searchParams?: Promise<{
    callbackUrl?: string;
  }>;
}>;

function getCallbackUrl(callbackUrl?: string): string {
  if (!callbackUrl?.startsWith("/") || callbackUrl.startsWith("//")) {
    return "/";
  }

  return callbackUrl;
}

const highlights = [
  {
    label: "Insights que mostram de onde vieram",
    icon: SparklesIcon,
  },
  {
    label: "Processamento no seu dispositivo",
    icon: LockKeyholeIcon,
  },
  {
    label: "Metas e dívidas com projeção da IA",
    icon: TargetIcon,
  },
] as const;

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = getCallbackUrl(params?.callbackUrl);

  return (
    <main className="dark min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen overflow-hidden bg-background md:grid-cols-[1.05fr_1fr]">
        <section className="relative flex min-h-[420px] flex-col justify-between overflow-hidden bg-[linear-gradient(150deg,#2b2569,#534ab7_55%,#7f77dd)] px-6 py-8 text-[#eeedfe] sm:px-10 lg:min-h-screen lg:px-11 lg:py-10">
          <div
            className="pointer-events-none absolute -top-20 -right-20 size-[280px] rounded-full border border-white/12"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-10 -bottom-[120px] size-[320px] rounded-full border border-white/10"
            aria-hidden="true"
          />

          <div className="relative z-10 flex items-center gap-2.5">
            <span className="grid size-[30px] place-items-center rounded-[9px] bg-white/16">
              <ActivityIcon className="size-5" aria-hidden="true" />
            </span>
            <div className="flex items-baseline gap-1 text-lg font-light tracking-normal">
              <span>Fin</span>
              <span className="font-semibold">Sight</span>
              <span className="font-mono text-[11px] tracking-normal opacity-80">
                AI
              </span>
            </div>
          </div>

          <div className="relative z-10 max-w-[420px]">
            <h1 className="text-[30px] leading-[1.2] font-medium tracking-normal">
              Clareza financeira, com a ajuda da inteligência artificial.
            </h1>
            <p className="mt-4 text-sm leading-[1.6] opacity-82">
              Importe seus extratos, entenda para onde vai seu dinheiro e receba
              sugestões que citam sempre a fonte. Sem julgamentos - só clareza.
            </p>

            <div className="mt-7 grid gap-3">
              {highlights.map((highlight) => {
                const Icon = highlight.icon;

                return (
                  <div
                    key={highlight.label}
                    className="flex items-center gap-[11px] text-sm"
                  >
                    <span className="grid size-[30px] shrink-0 place-items-center rounded-[8px] bg-white/14">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span>{highlight.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="relative z-10 text-xs opacity-60">
            © 2026 FinSight AI · Protótipo
          </p>
        </section>

        <section className="grid min-h-screen place-items-center overflow-y-auto bg-background p-8">
          <div className="w-full max-w-[360px]">
            <div
              className="mb-[26px] flex gap-1 rounded-md bg-muted p-1"
              role="tablist"
              aria-label="Acesso"
            >
              <button
                type="button"
                className="flex-1 rounded-[6px] bg-card px-2 py-2 text-[13px] font-medium text-foreground shadow-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                role="tab"
                aria-selected="true"
              >
                Entrar
              </button>
              <button
                type="button"
                className="flex-1 rounded-[6px] px-2 py-2 text-[13px] font-medium text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed"
                role="tab"
                aria-selected="false"
                disabled
              >
                Criar conta
              </button>
            </div>

            <h2 className="text-xl font-medium tracking-normal">
              Bem-vinda de volta
            </h2>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">
              Entre para ver sua visão financeira de maio.
            </p>

            <CredentialsLoginForm callbackUrl={callbackUrl} />

            <div className="my-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px bg-border" />
              <span>ou</span>
              <span className="h-px bg-border" />
            </div>

            <div className="grid gap-2">
              <form action={signInWithGoogle}>
                <input type="hidden" name="callbackUrl" value={callbackUrl} />
                <Button
                  type="submit"
                  variant="secondary"
                  className="h-9 w-full rounded-md border-border-strong bg-card px-3.5 text-sm font-medium text-foreground"
                >
                  Entrar com Google
                </Button>
              </form>

              <form action={signInWithGitHub}>
                <input type="hidden" name="callbackUrl" value={callbackUrl} />
                <Button
                  type="submit"
                  variant="secondary"
                  className="h-9 w-full rounded-md border-border-strong bg-card px-3.5 text-sm font-medium text-foreground"
                >
                  Entrar com GitHub
                </Button>
              </form>

              <Button
                type="button"
                variant="secondary"
                disabled
                className="h-9 w-full rounded-md border-border-strong bg-card px-3.5 text-sm font-medium text-foreground disabled:opacity-100"
              >
                <LandmarkIcon aria-hidden="true" />
                Conectar com meu banco
              </Button>
            </div>

            <p className="mt-6 text-center text-xs leading-[1.5] text-muted-foreground">
              Ao continuar você concorda com os Termos de Uso e a Política de
              Privacidade.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
