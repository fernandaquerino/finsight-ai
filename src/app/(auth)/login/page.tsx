import { Logo } from "@/components/app/Icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = getCallbackUrl(params?.callbackUrl);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6 flex flex-col gap-2">
          <Logo className="h-8 w-auto" />
          <h1 className="text-xl font-semibold text-foreground">
            Entrar no FinSight AI
          </h1>
          <p className="text-sm text-muted-foreground">
            Acesse sua área financeira com uma sessão segura.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <form action={signInWithGoogle}>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <Button type="submit" variant="secondary" className="w-full">
              Entrar com Google
            </Button>
          </form>
          <form action={signInWithGitHub}>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <Button type="submit" variant="secondary" className="w-full">
              Entrar com GitHub
            </Button>
          </form>

          <div className="my-2 h-px bg-border" />

          <CredentialsLoginForm callbackUrl={callbackUrl} />
        </div>
      </Card>
    </main>
  );
}
