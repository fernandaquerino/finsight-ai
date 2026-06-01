import * as React from "react";

import { cn } from "@/lib/utils";

interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}

function Divider({
  orientation = "horizontal",
  decorative = true,
  className,
  ...props
}: DividerProps) {
  return (
    <hr
      data-slot="divider"
      data-orientation={orientation}
      role={decorative ? "none" : "separator"}
      aria-orientation={!decorative ? orientation : undefined}
      className={cn(
        "shrink-0 border-none bg-border",
        orientation === "horizontal"
          ? "h-px w-full"
          : "h-full w-px self-stretch",
        className,
      )}
      {...props}
    />
  );
}

export { Divider };
