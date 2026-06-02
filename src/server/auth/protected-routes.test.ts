import { describe, expect, it } from "vitest";

import { getLoginRedirectUrl, isProtectedPath } from "./protected-routes";

describe("protected route helpers", () => {
  it("protects the app dashboard route", () => {
    expect(isProtectedPath("/")).toBe(true);
  });

  it("does not protect auth or api routes", () => {
    expect(isProtectedPath("/login")).toBe(false);
    expect(isProtectedPath("/api/auth/signin")).toBe(false);
  });

  it("builds a login redirect with callbackUrl", () => {
    const redirectUrl = getLoginRedirectUrl(
      new URL("http://localhost:3000/?month=2026-06"),
    );

    expect(redirectUrl.pathname).toBe("/login");
    expect(redirectUrl.searchParams.get("callbackUrl")).toBe("/?month=2026-06");
  });
});
