import { MonthYearPicker } from "@/components/app/MonthYearPicker";
import { Input } from "@/components/ui/Input";
import { SelectField } from "@/components/ui/Select";

import { CURRENCIES, type CurrencyCode } from "../../data/catalog";

const CURRENCY_OPTIONS = CURRENCIES.map((currency) => ({
  value: currency.code,
  label: currency.label,
}));

type ProfileStepProps = Readonly<{
  name: string;
  currency: CurrencyCode;
  trackingStartMonth: Date;
  onNameChange: (value: string) => void;
  onCurrencyChange: (value: CurrencyCode) => void;
  onTrackingStartMonthChange: (value: Date) => void;
}>;

export function ProfileStep({
  name,
  currency,
  trackingStartMonth,
  onNameChange,
  onCurrencyChange,
  onTrackingStartMonthChange,
}: ProfileStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">
          Como podemos te chamar?
        </h1>
        <p className="text-sm text-muted-foreground">
          Só para deixar sua experiência mais pessoal.
        </p>
      </div>

      <Input
        label="Seu nome"
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        placeholder="Ex.: Marina"
        autoFocus
      />

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">
          Moeda padrão
        </span>
        <SelectField
          aria-label="Moeda padrão"
          options={CURRENCY_OPTIONS}
          value={currency}
          onValueChange={(value) => onCurrencyChange(value as CurrencyCode)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">
          Mês inicial de acompanhamento
        </span>
        <MonthYearPicker
          value={trackingStartMonth}
          onChange={onTrackingStartMonthChange}
        />
        <p className="text-xs text-muted-foreground">
          A partir de quando você quer começar a registrar.
        </p>
      </div>
    </div>
  );
}
