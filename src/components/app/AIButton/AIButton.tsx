import Link from "next/link";
import { SparklesIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type AIButtonProps = Readonly<{
  href: string;
  label?: string;
  className?: string;
}>;

function AIButton({
  href,
  label = "Perguntar à IA",
  className,
}: AIButtonProps) {
  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant: "soft", size: "sm" }), className)}
    >
      <SparklesIcon className="size-3.5" aria-hidden="true" />
      {label}
    </Link>
  );
}

export { AIButton };
export type { AIButtonProps };
