import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";

import { MAX_HISTORY_MESSAGES, sanitizeUserText } from "@/ai/guards";
import { buildFinancialAssistantPrompt } from "@/ai/prompts/financial-assistant";
import { CHAT_MODEL_SETTINGS, getChatModel } from "@/ai/provider";
import { buildFinancialTools } from "@/ai/tools";
import type { Database } from "@/server/repositories";
import type { AIChatMessage } from "@/server/validators/ai-chat";

// Quantas rodadas de tool o modelo pode encadear antes de ser obrigado a
// responder. 5 cobre "resumo do mês + categorias + confirmar uma transação"
// sem abrir espaço para um loop caro.
const MAX_STEPS = 5;

export type StreamChatDeps = Readonly<{
  db: Database;
  userId: string;
  messages: readonly AIChatMessage[];
  now?: Date;
  // Injetável para teste: o Vitest passa um MockLanguageModel e nenhuma
  // chamada de API real acontece.
  model?: ReturnType<typeof getChatModel>;
}>;

// Corta o histórico para as últimas N mensagens e higieniza cada parte de
// texto. O que sobra é o único texto de origem do usuário que chega ao modelo.
function toSanitizedUIMessages(
  messages: readonly AIChatMessage[],
): Omit<UIMessage, "id">[] {
  return messages.slice(-MAX_HISTORY_MESSAGES).map((message) => ({
    role: message.role,
    parts: message.parts.map((part) => ({
      type: "text" as const,
      text: sanitizeUserText(part.text),
    })),
  }));
}

export async function streamChatResponse({
  db,
  userId,
  messages,
  now = new Date(),
  model,
}: StreamChatDeps) {
  return streamText({
    model: model ?? getChatModel(),
    system: buildFinancialAssistantPrompt(now),
    messages: await convertToModelMessages(toSanitizedUIMessages(messages)),
    // `userId` entra no fechamento das tools, nunca no prompt. Não existe
    // parâmetro de tool que permita o modelo apontar para outro usuário.
    tools: buildFinancialTools({ db, userId, now }),
    stopWhen: stepCountIs(MAX_STEPS),
    ...CHAT_MODEL_SETTINGS,
  });
}
