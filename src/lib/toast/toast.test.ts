import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";

import { showToast } from "./toast";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

describe("showToast", () => {
  it("delegates success toast", () => {
    showToast.success({ title: "Salvo", description: "Tudo certo." });

    expect(toast.success).toHaveBeenCalledWith("Salvo", {
      description: "Tudo certo.",
    });
  });

  it("delegates error, warning, and info toasts", () => {
    showToast.error({ title: "Erro" });
    showToast.warning({ title: "Atenção" });
    showToast.info({ title: "Informação" });

    expect(toast.error).toHaveBeenCalledWith("Erro", {
      description: undefined,
    });
    expect(toast.warning).toHaveBeenCalledWith("Atenção", {
      description: undefined,
    });
    expect(toast.info).toHaveBeenCalledWith("Informação", {
      description: undefined,
    });
  });
});
