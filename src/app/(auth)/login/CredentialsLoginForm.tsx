"use client";

import { useActionState } from "react";

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
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <Input
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
      />
      <Input
        name="password"
        type="password"
        label="Senha"
        autoComplete="current-password"
        required
      />
      {errorMessage && (
        <p className="text-sm text-danger" role="alert">
          {errorMessage}
        </p>
      )}
      <Button type="submit" loading={isPending}>
        Entrar com email
      </Button>
    </form>
  );
}
