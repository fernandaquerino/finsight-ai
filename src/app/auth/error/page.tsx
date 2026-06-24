import Link from "next/link";
import { CircleAlertIcon } from "lucide-react";

import { Logo } from "@/components/app/Icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type AuthErrorPageProps = Readonly<{
  searchParams?: Promise<{
    error?: string;
  }>;
}>;

type AuthErrorContent = Readonly<{
  title: string;
  description: string;
}>;

// Códigos enviados pelo Auth.js no parâmetro `?error=` da página de erro.
// Mensagens propositalmente genéricas: não vazam detalhe técnico (ex.: falha
// de conexão com o banco) ao usuário final.
const errorContentByCode: Record<string, AuthErrorContent> = {
  Configuration: {
    title: "Não foi possível concluir o login",
    description:
      "Tivemos um problema ao processar sua autenticação. Tente novamente em instantes.",
  },
  AccessDenied: {
    title: "Acesso negado",
    description:
      "Você não tem permissão para acessar com esta conta. Tente outra forma de entrar.",
  },
  Verification: {
    title: "Link expirado",
    description:
      "Este link de acesso expirou ou já foi usado. Volte ao login e tente novamente.",
  },
  OAuthAccountNotLinked: {
    title: "E-mail já cadastrado",
    description:
      "Este e-mail já está vinculado a outra forma de login. Entre pelo método usado no primeiro acesso.",
  },
};

const fallbackErrorContent: AuthErrorContent = {
  title: "Algo deu errado no login",
  description:
    "Não foi possível concluir a autenticação. Volte ao login e tente novamente.",
};

export default async function AuthErrorPage({
  searchParams,
}: AuthErrorPageProps) {
  const params = await searchParams;
  const errorCode = params?.error;
  const content =
    (errorCode ? errorContentByCode[errorCode] : undefined) ??
    fallbackErrorContent;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6 flex flex-col gap-2">
          <Logo className="h-8 w-auto" />
          <div
            className="flex size-10 items-center justify-center rounded-full bg-danger-soft text-danger"
            aria-hidden="true"
          >
            <CircleAlertIcon className="size-5" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            {content.title}
          </h1>
          <p className="text-sm text-muted-foreground">{content.description}</p>
        </div>

        <Button asChild className="w-full">
          <Link href="/login">Voltar para o login</Link>
        </Button>

        {errorCode && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Código do erro: {errorCode}
          </p>
        )}
      </Card>
    </main>
  );
}
