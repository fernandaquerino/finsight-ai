"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon, CircleAlertIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface CheckboxProps extends React.ComponentProps<
  typeof CheckboxPrimitive.Root
> {
  label?: string;
  helperText?: string;
  error?: string;
}

function Checkbox({
  className,
  id,
  label,
  helperText,
  error,
  ...props
}: CheckboxProps) {
  const generatedId = React.useId();
  const checkboxId = id ?? generatedId;
  const hasError = Boolean(error);
  const descriptionId = hasError
    ? `${checkboxId}-error`
    : helperText
      ? `${checkboxId}-helper`
      : undefined;

  return (
    <div className="grid gap-1.5">
      <div className="flex items-center gap-2">
        <CheckboxPrimitive.Root
          data-slot="checkbox"
          id={checkboxId}
          aria-describedby={descriptionId}
          aria-invalid={hasError || undefined}
          className={cn(
            "peer size-4 shrink-0 rounded-sm border border-input bg-background shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
            className,
          )}
          {...props}
        >
          <CheckboxPrimitive.Indicator
            data-slot="checkbox-indicator"
            className="flex items-center justify-center text-current"
          >
            <CheckIcon className="size-3.5" />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>

        {label && (
          <label
            htmlFor={checkboxId}
            className="cursor-pointer text-sm leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
          >
            {label}
          </label>
        )}
      </div>

      {helperText && !error ? (
        <p
          id={`${checkboxId}-helper`}
          className="pl-6 text-xs text-muted-foreground"
        >
          {helperText}
        </p>
      ) : null}

      {error ? (
        <p
          id={`${checkboxId}-error`}
          role="alert"
          className="flex items-center gap-1.5 pl-6 text-xs text-destructive"
        >
          <CircleAlertIcon className="size-3.5" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { Checkbox };
