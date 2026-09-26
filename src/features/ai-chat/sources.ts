import { getToolName, isToolUIPart, type UIMessage } from "ai";

export type ChatSource = Readonly<{
  toolName: string;
  description: string;
}>;

function readSource(output: unknown): string | null {
  if (typeof output !== "object" || output === null) return null;

  const source = (output as { source?: unknown }).source;
  return typeof source === "string" && source.length > 0 ? source : null;
}

// Toda tool devolve um campo `source` descrevendo o recorte de dados que gerou
// o número. Exibimos essa string, e não uma frase do modelo: a fonte precisa
// ser verificável mesmo que o texto da resposta erre.
export function collectSources(message: UIMessage): ChatSource[] {
  const sources: ChatSource[] = [];

  for (const part of message.parts) {
    if (!isToolUIPart(part) || part.state !== "output-available") continue;

    const description = readSource(part.output);
    if (!description) continue;

    sources.push({ toolName: getToolName(part), description });
  }

  return sources;
}

// Texto corrido da mensagem: concatena as partes de texto na ordem em que o
// modelo as emitiu.
export function collectText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}
