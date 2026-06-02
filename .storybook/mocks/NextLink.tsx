import type { ComponentPropsWithoutRef } from "react";

type LinkHref = string | Record<string, unknown>;

type LinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: LinkHref;
};

export default function Link({ href, children, ...props }: LinkProps) {
  const resolvedHref = typeof href === "string" ? href : "#";
  return (
    <a href={resolvedHref} {...props}>
      {children}
    </a>
  );
}
