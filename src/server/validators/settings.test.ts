import { describe, expect, it } from "vitest";

import {
  changePasswordSchema,
  createAccountSchema,
  deleteAccountSchema,
  updateSettingsSchema,
} from "./settings";

describe("updateSettingsSchema", () => {
  it("rejects an empty patch", () => {
    expect(updateSettingsSchema.safeParse({}).success).toBe(false);
  });

  it("accepts a single preference", () => {
    const parsed = updateSettingsSchema.safeParse({ aiAutoCategorize: false });

    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual({ aiAutoCategorize: false });
  });

  it("accepts a partial notifications object", () => {
    const parsed = updateSettingsSchema.safeParse({
      notifications: { spendAlerts: false },
    });

    expect(parsed.success).toBe(true);
    expect(parsed.data?.notifications).toEqual({ spendAlerts: false });
  });

  it("rejects an empty notifications object", () => {
    const parsed = updateSettingsSchema.safeParse({ notifications: {} });

    expect(parsed.success).toBe(false);
  });

  it("normalizes a masked CPF to digits", () => {
    const parsed = updateSettingsSchema.safeParse({ cpf: "529.982.247-25" });

    expect(parsed.success).toBe(true);
    expect(parsed.data?.cpf).toBe("52998224725");
  });

  it("rejects a CPF with wrong check digits", () => {
    expect(updateSettingsSchema.safeParse({ cpf: "52998224726" }).success).toBe(
      false,
    );
  });

  it("rejects a repeated-digit CPF", () => {
    expect(updateSettingsSchema.safeParse({ cpf: "11111111111" }).success).toBe(
      false,
    );
  });

  it("rejects a CPF with the wrong length", () => {
    expect(updateSettingsSchema.safeParse({ cpf: "5299822472" }).success).toBe(
      false,
    );
  });

  it("clears the CPF with an empty string", () => {
    const parsed = updateSettingsSchema.safeParse({ cpf: "" });

    expect(parsed.success).toBe(true);
    expect(parsed.data?.cpf).toBeNull();
  });

  it("clears the phone with an empty string", () => {
    const parsed = updateSettingsSchema.safeParse({ phone: "  " });

    expect(parsed.success).toBe(true);
    expect(parsed.data?.phone).toBeNull();
  });

  it("rejects a phone with letters", () => {
    expect(updateSettingsSchema.safeParse({ phone: "abc" }).success).toBe(
      false,
    );
  });

  it("rejects a blank name", () => {
    expect(updateSettingsSchema.safeParse({ name: "   " }).success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  const valid = {
    currentPassword: "senha-antiga-1",
    newPassword: "senha-nova-99",
    confirmPassword: "senha-nova-99",
  };

  it("accepts a strong, confirmed password", () => {
    expect(changePasswordSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(
      changePasswordSchema.safeParse({
        ...valid,
        newPassword: "abc1",
        confirmPassword: "abc1",
      }).success,
    ).toBe(false);
  });

  it("rejects a password without digits", () => {
    expect(
      changePasswordSchema.safeParse({
        ...valid,
        newPassword: "somenteletras",
        confirmPassword: "somenteletras",
      }).success,
    ).toBe(false);
  });

  it("rejects a mismatched confirmation", () => {
    const parsed = changePasswordSchema.safeParse({
      ...valid,
      confirmPassword: "outra-senha-99",
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0]?.path).toEqual(["confirmPassword"]);
  });

  it("rejects reusing the current password", () => {
    const parsed = changePasswordSchema.safeParse({
      currentPassword: "senha-nova-99",
      newPassword: "senha-nova-99",
      confirmPassword: "senha-nova-99",
    });

    expect(parsed.success).toBe(false);
  });
});

describe("deleteAccountSchema", () => {
  it("accepts the exact confirmation word", () => {
    expect(
      deleteAccountSchema.safeParse({ confirmation: "ENCERRAR" }).success,
    ).toBe(true);
  });

  it("rejects a different case", () => {
    expect(
      deleteAccountSchema.safeParse({ confirmation: "encerrar" }).success,
    ).toBe(false);
  });

  it("rejects anything else", () => {
    expect(deleteAccountSchema.safeParse({ confirmation: "sim" }).success).toBe(
      false,
    );
  });
});

describe("createAccountSchema", () => {
  it("defaults institution and balance to null", () => {
    const parsed = createAccountSchema.safeParse({
      name: "Conta principal",
      type: "checking",
    });

    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual({
      name: "Conta principal",
      type: "checking",
      institution: null,
      initialBalance: null,
    });
  });

  it("rejects an unknown account type", () => {
    expect(
      createAccountSchema.safeParse({ name: "X", type: "crypto" }).success,
    ).toBe(false);
  });

  it("rejects a blank name", () => {
    expect(
      createAccountSchema.safeParse({ name: "  ", type: "checking" }).success,
    ).toBe(false);
  });
});
