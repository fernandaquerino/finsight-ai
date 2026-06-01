"use client";

import * as React from "react";
import { CircleAlertIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";

export interface SelectOption {
  value: string;
  label: string;
}

interface BaseSelectFieldProps {
  options: SelectOption[];
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  id?: string;
}

type SelectFieldA11yProps =
  | {
      label: string;
      "aria-label"?: string;
      "aria-labelledby"?: string;
    }
  | {
      label?: never;
      "aria-label": string;
      "aria-labelledby"?: string;
    }
  | {
      label?: never;
      "aria-label"?: string;
      "aria-labelledby": string;
    };

type SelectFieldProps = BaseSelectFieldProps & SelectFieldA11yProps;

function SelectField({
  id,
  label,
  options,
  placeholder,
  helperText,
  error,
  disabled,
  value,
  defaultValue,
  onValueChange,
  className,
  ...props
}: SelectFieldProps) {
  const generatedId = React.useId();
  const triggerId = id ?? generatedId;
  const hasError = Boolean(error);
  const descriptionId = hasError
    ? `${triggerId}-error`
    : helperText
      ? `${triggerId}-helper`
      : undefined;

  return (
    <div className={cn("grid w-full gap-2", className)}>
      {label && (
        <label
          htmlFor={triggerId}
          className="text-xs font-medium text-foreground"
        >
          {label}
        </label>
      )}

      <Select
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          id={triggerId}
          aria-describedby={descriptionId}
          aria-invalid={hasError || undefined}
          aria-label={!label ? props["aria-label"] : undefined}
          aria-labelledby={!label ? props["aria-labelledby"] : undefined}
          className={cn(
            hasError && "border-destructive focus-visible:ring-destructive/20",
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {helperText && !error ? (
        <p id={`${triggerId}-helper`} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      ) : null}

      {error ? (
        <p
          id={`${triggerId}-error`}
          role="alert"
          className="flex items-center gap-1.5 text-xs text-destructive"
        >
          <CircleAlertIcon className="size-3.5" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { SelectField };
