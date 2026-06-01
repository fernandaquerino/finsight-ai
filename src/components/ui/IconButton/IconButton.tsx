import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const iconButtonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "border bg-background text-foreground hover:bg-muted hover:text-foreground",
        ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
        outline:
          "border border-primary bg-background text-primary hover:bg-primary-soft",
      },
      size: {
        sm: "size-8 [&_svg]:size-3.5",
        md: "size-9 [&_svg]:size-4",
        lg: "size-10 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "md",
    },
  },
);

interface IconButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  "aria-label": string;
  asChild?: boolean;
}

function IconButton({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: IconButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="icon-button"
      type={!asChild ? "button" : undefined}
      className={cn(iconButtonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { IconButton, iconButtonVariants };
