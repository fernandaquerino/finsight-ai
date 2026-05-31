import { describe, expect, it, vi } from "vitest";

import { getEnv } from "@/lib/env";

describe("getEnv", () => {
  it("returns configured environment values", () => {
    vi.stubEnv("DATABASE_URL", "postgresql://example");

    expect(getEnv("DATABASE_URL")).toBe("postgresql://example");
  });

  it("throws when a required environment value is missing", () => {
    vi.stubEnv("REDIS_URL", "");

    expect(() => getEnv("REDIS_URL")).toThrow(
      "Missing required environment variable: REDIS_URL",
    );
  });
});
