import { Fragment, type ReactNode } from "react";

// O modelo é instruído a usar **negrito** só nos números que importam. Em vez
// de arrastar um parser de Markdown para o bundle por causa de uma marcação,
// tratamos exatamente essa. Qualquer outro caractere é renderizado como texto —
// nada de HTML vindo do modelo.
export function renderInlineMarkdown(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((chunk, index) =>
    chunk.startsWith("**") && chunk.endsWith("**") && chunk.length > 4 ? (
      <strong key={index} className="font-semibold">
        {chunk.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={index}>{chunk}</Fragment>
    ),
  );
}
