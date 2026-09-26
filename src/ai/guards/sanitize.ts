// Guards de entrada do chat. Conteúdo vindo do usuário (e, mais adiante, de
// extratos e PDFs) é **dado**, nunca instrução. Aqui só normalizamos e
// limitamos; a separação instrução/dado é reforçada no system prompt.

// Limite por mensagem. Acima disso a pergunta quase certamente é colagem de
// documento — que tem um fluxo próprio (importação), não o chat.
export const MAX_MESSAGE_LENGTH = 2_000;

// Quantas mensagens do histórico o cliente pode reenviar. Segura o custo e o
// tamanho do contexto sem precisar de persistência ainda.
export const MAX_HISTORY_MESSAGES = 20;

// As duas classes abaixo são montadas com `new RegExp` a partir de string, e
// não como literal: assim os escapes \uXXXX sobrevivem ao Prettier, que
// converteria os caracteres de controle em bytes literais no fonte.

// Caracteres de controle, exceto quebra de linha e tab.
const CONTROL_CHARS = new RegExp(
  "[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]",
  "g",
);

// Marcadores bidirecionais Unicode — o vetor clássico de esconder texto que o
// humano não vê mas o modelo lê.
const BIDI_CHARS = new RegExp(
  "[\\u200E\\u200F\\u202A-\\u202E\\u2066-\\u2069]",
  "g",
);

// Sequências que imitam a moldura de uma conversa. Não tentamos "detectar
// injeção" (isso é uma corrida perdida) — só quebramos as marcações que
// poderiam fazer o texto do usuário passar por mensagem de sistema.
const ROLE_MARKERS = /^[ \t]*(system|assistant|developer|user)[ \t]*:/gim;

export function sanitizeUserText(raw: string): string {
  return raw
    .replace(CONTROL_CHARS, "")
    .replace(BIDI_CHARS, "")
    .replace(ROLE_MARKERS, (match) => match.replace(":", " -"))
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH);
}
