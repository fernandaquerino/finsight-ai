"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/../auth";

function getSafeCallbackUrl(callbackUrl: FormDataEntryValue | null): string {
  if (typeof callbackUrl !== "string" || !callbackUrl.startsWith("/")) {
    return "/";
  }

  if (callbackUrl.startsWith("//")) {
    return "/";
  }

  return callbackUrl;
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  await signIn("google", {
    redirectTo: getSafeCallbackUrl(formData.get("callbackUrl")),
  });
}

export async function signInWithGitHub(formData: FormData): Promise<void> {
  await signIn("github", {
    redirectTo: getSafeCallbackUrl(formData.get("callbackUrl")),
  });
}

export async function signInWithCredentials(
  _previousState: string | null,
  formData: FormData,
): Promise<string | null> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: getSafeCallbackUrl(formData.get("callbackUrl")),
    });

    return null;
  } catch (error) {
    if (error instanceof AuthError) {
      return "Email ou senha inválidos.";
    }

    throw error;
  }
}
