import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { UIMessage } from "ai";

const sendMessage = vi.fn();
const clearError = vi.fn();

const chatState: {
  messages: UIMessage[];
  status: "ready" | "submitted" | "streaming" | "error";
  error: Error | undefined;
} = { messages: [], status: "ready", error: undefined };

// O hook do AI SDK é mockado: nenhum teste faz requisição nem chama modelo.
vi.mock("@ai-sdk/react", () => ({
  useChat: () => ({ ...chatState, sendMessage, clearError }),
}));

const { AIChatScreen } = await import("./AIChatScreen");

beforeEach(() => {
  vi.clearAllMocks();
  chatState.messages = [];
  chatState.status = "ready";
  chatState.error = undefined;
});

describe("AIChatScreen", () => {
  it("sem conversa, mostra o convite e as sugestões", () => {
    render(<AIChatScreen />);

    expect(
      screen.getByRole("heading", { name: "Pergunte sobre suas finanças" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Onde gastei mais este mês?" }),
    ).toBeInTheDocument();
  });

  it("clicar numa sugestão envia a pergunta", async () => {
    const user = userEvent.setup();
    render(<AIChatScreen />);

    await user.click(
      screen.getByRole("button", { name: "Onde gastei mais este mês?" }),
    );

    expect(sendMessage).toHaveBeenCalledWith({
      text: "Onde gastei mais este mês?",
    });
  });

  it("digitar e enviar manda o texto para o chat", async () => {
    const user = userEvent.setup();
    render(<AIChatScreen />);

    await user.type(
      screen.getByRole("textbox", { name: "Digite sua pergunta" }),
      "quanto gastei?",
    );
    await user.click(screen.getByRole("button", { name: "Enviar pergunta" }));

    expect(sendMessage).toHaveBeenCalledWith({ text: "quanto gastei?" });
  });

  it("enquanto aguarda a resposta, mostra o estado de análise", () => {
    chatState.status = "submitted";
    chatState.messages = [
      { id: "m1", role: "user", parts: [{ type: "text", text: "oi" }] },
    ];

    render(<AIChatScreen />);

    expect(screen.getByRole("status")).toHaveAccessibleName(
      "Analisando seus dados...",
    );
  });

  it("na resposta concluída, exibe o texto e a fonte devolvida pela tool", () => {
    chatState.messages = [
      { id: "m1", role: "user", parts: [{ type: "text", text: "oi" }] },
      {
        id: "m2",
        role: "assistant",
        parts: [
          {
            type: "tool-getMonthlySummary",
            toolCallId: "c1",
            state: "output-available",
            input: {},
            output: { source: "84 transações de maio de 2026" },
          },
          {
            type: "text",
            text: "Você gastou **R$ 6.500** em maio.",
          },
        ],
      } as UIMessage,
    ];

    render(<AIChatScreen />);

    expect(screen.getByText("R$ 6.500")).toBeInTheDocument();
    expect(
      screen.getByText("84 transações de maio de 2026"),
    ).toBeInTheDocument();
  });

  it("em caso de erro, mostra o estado de erro com ação", () => {
    chatState.status = "error";
    chatState.error = new Error("falhou");
    chatState.messages = [
      { id: "m1", role: "user", parts: [{ type: "text", text: "oi" }] },
    ];

    render(<AIChatScreen />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "A IA não conseguiu responder",
    );
  });
});
