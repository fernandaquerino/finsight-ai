"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

import { useThemeOptional } from "@/components/app/theme-provider";

function Toaster({ ...props }: ToasterProps) {
  const resolvedTheme = useThemeOptional()?.resolvedTheme;

  return (
    <Sonner
      data-slot="sonner"
      theme={resolvedTheme}
      toastOptions={{
        classNames: {
          toast: "border border-border bg-card text-card-foreground shadow-lg",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
