type ApiErrorBody = { error: { code: string; message: string } };

export class SettingsRequestError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "SettingsRequestError";
  }
}

// Desempacota o envelope { data } dos route handlers e converte { error } na
// exceção tipada. Mesmo helper usado em features/goals/hooks.
export async function request<T>(
  url: string,
  init: RequestInit,
  fallbackMessage: string,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });

  if (!response.ok) {
    let code = "INTERNAL_ERROR";
    let message = fallbackMessage;
    try {
      const body = (await response.json()) as ApiErrorBody;
      code = body.error?.code ?? code;
      message = body.error?.message ?? message;
    } catch {
      // resposta sem JSON — mantém mensagem padrão.
    }
    throw new SettingsRequestError(message, code, response.status);
  }

  const envelope = (await response.json()) as { data: T };
  return envelope.data;
}
