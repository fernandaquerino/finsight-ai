"use client";

import { useActionState } from "react";
import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import { signInWithCredentials } from "./actions";

type CredentialsLoginFormProps = Readonly<{
  callbackUrl: string;
}>;

export function CredentialsLoginForm({
  callbackUrl,
}: CredentialsLoginFormProps) {
  const [errorMessage, formAction, isPending] = useActionState(
    signInWithCredentials,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <Input
        name="email"
        type="email"
        label="E-mail"
        autoComplete="email"
        placeholder="example@email.com"
        className="h-[38px] rounded-md border-border-strong bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)_/_0.12)]"
        required
      />
      <Input
        name="password"
        type="password"
        label="Senha"
        autoComplete="current-password"
        placeholder="••••••••"
        className="h-[38px] rounded-md border-border-strong bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)_/_0.12)]"
        required
      />
      {errorMessage && (
        <p className="text-sm text-danger" role="alert">
          {errorMessage}
        </p>
      )}
      <button
        type="button"
        disabled
        className="-mt-1.5 self-end text-[13px] font-medium text-primary transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-100"
      >
        Esqueci minha senha
      </button>
      <Button
        type="submit"
        loading={isPending}
        className="h-9 rounded-md border border-primary bg-primary px-3.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Entrar
        <ArrowRightIcon aria-hidden="true" />
      </Button>
    </form>
  );
}
