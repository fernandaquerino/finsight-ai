type FormatMoneyOptions = Readonly<{
  currency?: "BRL";
  locale?: "pt-BR";
  signDisplay?: Intl.NumberFormatOptions["signDisplay"];
}>;

const defaultMoneyOptions = {
  currency: "BRL",
  locale: "pt-BR",
  signDisplay: "auto",
} as const satisfies Required<FormatMoneyOptions>;

function normalizeMoneySpacing(value: string): string {
  return value.replace(/\u00a0/g, " ");
}

export function formatMoney(
  value: number,
  options: FormatMoneyOptions = {},
): string {
  const mergedOptions = { ...defaultMoneyOptions, ...options };

  return normalizeMoneySpacing(
    new Intl.NumberFormat(mergedOptions.locale, {
      style: "currency",
      currency: mergedOptions.currency,
      signDisplay: mergedOptions.signDisplay,
    }).format(value),
  );
}

export function formatSignedMoney(value: number): string {
  if (Object.is(value, -0) || value === 0) {
    return formatMoney(0, { signDisplay: "never" });
  }

  const absoluteValue = Math.abs(value);
  const formattedAbsoluteValue = formatMoney(absoluteValue, {
    signDisplay: "never",
  });

  return value > 0
    ? `+${formattedAbsoluteValue}`
    : `-${formattedAbsoluteValue}`;
}
