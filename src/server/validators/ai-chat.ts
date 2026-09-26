import { z } from "zod";

import { MAX_MESSAGE_LENGTH } from "@/ai/guards";

// Corpo enviado pelo `useChat` do AI SDK. Aceitamos só o que usamos: mensagens
// de texto com papel user/assistant. Partes de tool vindas do cliente são
// descartadas de propósito — o resultado de uma tool é produzido no servidor e
// não pode ser forjado pelo browser.
const textPartSchema = z.object({
  type: z.literal("text"),
  text: z.string().max(MAX_MESSAGE_LENGTH),
});

const uiMessageSchema = z.object({
  id: z.string().max(128).optional(),
  role: z.enum(["user", "assistant"]),
  parts: z.array(textPartSchema).min(1).max(20),
});

// Teto de payload, não de contexto: o `useChat` reenvia a conversa inteira a
// cada turno. O corte real para o modelo é feito no route handler
// (MAX_HISTORY_MESSAGES) — rejeitar aqui derrubaria o chat depois de N turnos.
const MAX_PAYLOAD_MESSAGES = 200;

export const aiChatRequestSchema = z.object({
  messages: z
    .array(uiMessageSchema)
    .min(1, "envie ao menos uma mensagem")
    .max(MAX_PAYLOAD_MESSAGES, "histórico longo demais")
    .refine((messages) => messages.at(-1)?.role === "user", {
      message: "a última mensagem precisa ser do usuário",
    }),
});

export type AIChatRequest = z.infer<typeof aiChatRequestSchema>;
export type AIChatMessage = z.infer<typeof uiMessageSchema>;
