import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-card transition-[border-color,box-shadow,background-color] duration-150 hover:shadow-pop",
  {
    variants: {
      variant: {
        default: "border-border",
        metric: "border-foreground shadow-none",
        ai: "border-primary/20 bg-primary-soft shadow-none",
      },
      padding: {
        default: "p-5",
        sm: "p-4",
        none: "p-0",
      },
      interactive: {
        true: "cursor-pointer hover:border-border-strong hover:shadow-pop focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)_/_0.12)] focus-visible:outline-none",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      interactive: false,
    },
  },
);

interface CardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

function Card({
  className,
  variant,
  padding,
  interactive,
  tabIndex,
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      tabIndex={interactive && tabIndex === undefined ? 0 : tabIndex}
      className={cn(cardVariants({ variant, padding, interactive, className }))}
      {...props}
    />
  );
}

function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-header"
      className={cn("mb-3 flex items-start justify-between gap-3", className)}
      {...props}
    />
  );
}

function CardEyebrow({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="card-eyebrow"
      className={cn(
        "text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      data-slot="card-title"
      className={cn("text-sm font-semibold text-card-foreground", className)}
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-[13px] leading-6 text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-content"
      className={cn("space-y-3", className)}
      {...props}
    />
  );
}

function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-footer"
      className={cn("mt-4 flex items-center gap-2", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardEyebrow,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
};
