import type { ComponentPropsWithoutRef } from "react";

type ImageProps = Omit<ComponentPropsWithoutRef<"img">, "src"> & {
  src: string | { src: string };
  fill?: boolean;
};

export default function Image({
  src,
  alt,
  fill,
  className,
  ...props
}: ImageProps) {
  const resolvedSrc = typeof src === "string" ? src : src.src;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolvedSrc}
      alt={alt ?? ""}
      className={className}
      style={
        fill
          ? { position: "absolute", inset: 0, width: "100%", height: "100%" }
          : undefined
      }
      {...props}
    />
  );
}
