import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

// Modelo padrão do chat. Sobrescrito por OPENAI_CHAT_MODEL para permitir
// trocar de modelo sem deploy de código (e para os testes nunca dependerem
// de um id específico).
const DEFAULT_CHAT_MODEL = "gpt-5.4-mini";

// Limites explícitos por use case — exigência do CLAUDE.md. O chat é curto e
// fundamentado em tools; não precisa de janela grande de saída.
export const CHAT_MODEL_SETTINGS = {
  temperature: 0.3,
  maxOutputTokens: 900,
} as const;

// A chave do provider é opcional no boot: a aplicação inteira não deve quebrar
// porque o chat não está configurado. Quem chama traduz este erro em 503.
export class AIProviderUnavailableError extends Error {
  readonly code = "AI_UNAVAILABLE";

  constructor() {
    super("OPENAI_API_KEY não configurada.");
    this.name = "AIProviderUnavailableError";
  }
}

export function getChatModel(): LanguageModel {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new AIProviderUnavailableError();
  }

  const openai = createOpenAI({ apiKey });

  return openai(process.env.OPENAI_CHAT_MODEL ?? DEFAULT_CHAT_MODEL);
}
