import { useState } from "react";
import { Landmark, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { SelectField } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

import {
  ACCOUNT_SUGGESTIONS,
  ACCOUNT_TYPES,
  type AccountTypeValue,
} from "../../data/catalog";
import type { OnboardingAccountDraft } from "../../types";

const TYPE_OPTIONS = ACCOUNT_TYPES.map((type) => ({
  value: type.value,
  label: type.label,
}));

const TYPE_LABELS = new Map(ACCOUNT_TYPES.map((t) => [t.value, t.label]));

// Aceita "1234.56" ou "1.234,56" -> 1234.56. Retorna undefined se vazio/ inválido.
function parseBalance(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }

  const normalized = trimmed.replace(/\./g, "").replace(",", ".");
  const value = Number(normalized);

  return Number.isFinite(value) ? value : undefined;
}

type AccountsStepProps = Readonly<{
  accounts: OnboardingAccountDraft[];
  onAdd: (account: Omit<OnboardingAccountDraft, "id">) => void;
  onRemove: (id: string) => void;
}>;

export function AccountsStep({ accounts, onAdd, onRemove }: AccountsStepProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountTypeValue>("checking");
  const [balance, setBalance] = useState("");

  function handleAdd() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    onAdd({ name: trimmedName, type, initialBalance: parseBalance(balance) });
    setName("");
    setType("checking");
    setBalance("");
  }

  const addedNames = new Set(accounts.map((account) => account.name));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">
          Adicione suas contas
        </h1>
        <p className="text-sm text-muted-foreground">
          Comece com contas manuais — você pode importar extratos depois.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          Sugestões rápidas
        </span>
        <div className="flex flex-wrap gap-2">
          {ACCOUNT_SUGGESTIONS.map((suggestion) => {
            const alreadyAdded = addedNames.has(suggestion.name);

            return (
              <button
                key={suggestion.key}
                type="button"
                disabled={alreadyAdded}
                onClick={() =>
                  onAdd({ name: suggestion.name, type: suggestion.type })
                }
                className={cn(
                  "flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:border-muted-foreground/40",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: suggestion.color }}
                  aria-hidden="true"
                />
                {suggestion.name}
                <Plus
                  className="size-3.5 text-muted-foreground"
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Nome da conta"
            value={name}
            placeholder="Ex.: Conta principal"
            onChange={(event) => setName(event.target.value)}
          />
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">Tipo</span>
            <SelectField
              aria-label="Tipo da conta"
              options={TYPE_OPTIONS}
              value={type}
              onValueChange={(value) => setType(value as AccountTypeValue)}
            />
          </div>
        </div>

        <div className="flex items-end gap-3">
          <Input
            label="Saldo inicial (opcional)"
            className="flex-1"
            inputMode="decimal"
            prefix="R$"
            value={balance}
            placeholder="0,00"
            onChange={(event) => setBalance(event.target.value)}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleAdd}
            disabled={!name.trim()}
          >
            <Plus />
            Adicionar
          </Button>
        </div>
      </div>

      {accounts.length > 0 && (
        <ul className="flex flex-col gap-2">
          {accounts.map((account) => (
            <li
              key={account.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
            >
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground"
                aria-hidden="true"
              >
                <Landmark className="size-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {account.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {TYPE_LABELS.get(account.type)}
                </p>
              </div>
              <IconButton
                size="sm"
                variant="ghost"
                aria-label={`Remover ${account.name}`}
                onClick={() => onRemove(account.id)}
              >
                <X />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
