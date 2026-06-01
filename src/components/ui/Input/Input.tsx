import * as React from "react";
import { CircleAlertIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "prefix"
> {
  label?: string;
  helperText?: string;
  error?: string;
  prefix?: string;
}

function Input({
  className,
  type,
  label,
  id,
  helperText,
  error,
  disabled,
  prefix,
  ...props
}: InputProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const hasError = Boolean(error);
  const descriptionId = hasError
    ? `${inputId}-error`
    : helperText
      ? `${inputId}-helper`
      : undefined;

  return (
    <div className="grid w-full gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-foreground"
        >
          {label}
          {props.required ? (
            <span className="ml-1 text-destructive" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      )}
      <div className="relative">
        {prefix ? (
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
            {prefix}
          </span>
        ) : null}
        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          type={type}
          data-slot="input"
          aria-describedby={descriptionId}
          className={cn(
            "flex h-[38px] w-full rounded-md border border-border bg-card px-3 py-0 text-[13.5px] text-foreground transition-[border-color,box-shadow] duration-[140ms] outline-none file:border-0 file:bg-transparent file:text-[13.5px] file:font-medium placeholder:text-muted-foreground focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)_/_0.12)] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:shadow-[0_0_0_3px_hsl(var(--destructive)_/_0.12)]",
            prefix && "pl-10",
            className,
          )}
          {...props}
        />
      </div>

      {helperText && !error ? (
        <p id={`${inputId}-helper`} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      ) : null}

      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="flex items-center gap-1.5 text-xs text-destructive"
        >
          <CircleAlertIcon className="size-3.5" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export { Input };
