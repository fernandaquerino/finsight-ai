import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DashboardEmptyState } from "./DashboardEmptyState";

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("DashboardEmptyState hydration", () => {
  it("hydrates without server/client mismatch on the CTA links", async () => {
    const errors: string[] = [];
    const spy = vi.spyOn(console, "error").mockImplementation((...args) => {
      errors.push(args.map(String).join(" "));
    });

    const html = renderToString(<DashboardEmptyState />);
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    await act(async () => {
      hydrateRoot(container, <DashboardEmptyState />);
    });

    spy.mockRestore();

    const hydrationErrors = errors.filter((message) =>
      /hydrat|did not match|server rendered|server HTML/i.test(message),
    );
    expect(hydrationErrors).toEqual([]);
  });
});
