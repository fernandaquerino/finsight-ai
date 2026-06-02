"use client";

import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import type { VariantProps } from "class-variance-authority";

import { buttonVariants } from "@/components/ui/Button/button-variants";
import { cn } from "@/lib/utils";

type ButtonVariantProps = VariantProps<typeof buttonVariants>;
type ButtonSize = NonNullable<ButtonVariantProps["size"]>;

interface BaseButtonProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label">,
    Omit<ButtonVariantProps, "size"> {
  size?: ButtonSize;
  asChild?: boolean;
  loading?: boolean;
}

type ButtonA11yProps =
  | {
      size: "icon";
      "aria-label": string;
      "aria-labelledby"?: string;
    }
  | {
      size?: Exclude<ButtonSize, "icon">;
      "aria-label"?: string;
      "aria-labelledby"?: string;
    };

type ButtonProps = BaseButtonProps & ButtonA11yProps;

function Spinner() {
  return (
    <svg
      className="size-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  onClick,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  const isDisabled = disabled || loading;
  const accessibleName = props["aria-label"] ?? props["aria-labelledby"];

  if (
    process.env.NODE_ENV !== "production" &&
    size === "icon" &&
    !accessibleName
  ) {
    console.warn(
      'Button with size="icon" must include aria-label or aria-labelledby.',
    );
  }

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (isDisabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    onClick?.(event);
  }

  return (
    <Comp
      data-slot="button"
      data-loading={loading ? "" : undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={!asChild ? isDisabled : undefined}
      aria-disabled={asChild && isDisabled ? true : undefined}
      aria-busy={loading || undefined}
      onClick={handleClick}
      {...props}
    >
      <Slottable>{children}</Slottable>
      {loading && <Spinner />}
    </Comp>
  );
}

export { Button };
