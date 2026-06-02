import { describe, expect, it } from "vitest";

import { vi } from "vitest";

vi.mock("@/../auth", () => ({
  auth: vi.fn(),
}));

import { getCurrentUser, requireUserId, UnauthorizedError } from "./session";

describe("server auth session helpers", () => {
  it("returns the current user from the server session", async () => {
    await expect(
      getCurrentUser(async () => ({
        expires: new Date("2026-06-01").toISOString(),
        user: {
          id: "user-1",
          name: "Ada",
          email: "ada@example.com",
          image: null,
        },
      })),
    ).resolves.toEqual({
      id: "user-1",
      name: "Ada",
      email: "ada@example.com",
      image: null,
    });
  });

  it("returns null when the session is missing", async () => {
    await expect(getCurrentUser(async () => null)).resolves.toBeNull();
  });

  it("returns the required user id when authenticated", async () => {
    await expect(
      requireUserId(async () => ({
        expires: new Date("2026-06-01").toISOString(),
        user: {
          id: "user-1",
          name: null,
          email: "ada@example.com",
          image: null,
        },
      })),
    ).resolves.toBe("user-1");
  });

  it("throws 401 when the user is not authenticated", async () => {
    await expect(requireUserId(async () => null)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      statusCode: 401,
    });
  });

  it("throws UnauthorizedError when the session has no user id", async () => {
    await expect(
      requireUserId(async () => ({
        expires: new Date("2026-06-01").toISOString(),
        user: {
          name: "Ada",
          email: "ada@example.com",
          image: null,
        },
      })),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
