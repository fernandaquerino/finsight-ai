"use client";

import * as React from "react";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const AVATAR_COLORS = [
  "bg-[hsl(248,53%,50%)] text-white",
  "bg-[hsl(162,70%,30%)] text-white",
  "bg-[hsl(212,78%,44%)] text-white",
  "bg-[hsl(33,88%,42%)] text-[hsl(240,10%,12%)]",
  "bg-[hsl(0,68%,47%)] text-white",
  "bg-[hsl(280,60%,45%)] text-white",
  "bg-[hsl(195,70%,38%)] text-white",
  "bg-[hsl(15,72%,45%)] text-white",
] as const;

const FALLBACK_COLOR = "bg-[hsl(248,53%,50%)] text-white";

function getAvatarColor(name: string): string {
  if (!name) return FALLBACK_COLOR;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffff;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length] ?? FALLBACK_COLOR;
}

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";

  const parts = trimmed.split(/\s+/);
  const first = parts[0];
  if (!first) return "?";
  if (parts.length === 1) return first.charAt(0).toUpperCase();

  const last = parts[parts.length - 1];
  return (first.charAt(0) + (last?.charAt(0) ?? "")).toUpperCase();
}

const avatarVariants = cva(
  "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-semibold leading-none",
  {
    variants: {
      size: {
        sm: "size-7 text-[10px]",
        md: "size-9 text-xs",
        lg: "size-11 text-sm",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

interface AvatarProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof avatarVariants> {
  name: string;
  src?: string;
  alt?: string;
}

function Avatar({ name, src, alt, size, className, ...props }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);
  const showImage = src && !imgError;
  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);

  return (
    <span
      data-slot="avatar"
      role="img"
      aria-label={alt ?? name}
      className={cn(
        avatarVariants({ size }),
        !showImage && colorClass,
        className,
      )}
      {...props}
    >
      {showImage ? (
        <Image
          src={src}
          alt=""
          aria-hidden="true"
          fill
          // Avatar tem tamanho fixo (máx. 44px); evita o warning de "fill" sem
          // "sizes" e impede o browser de buscar uma imagem maior que o preciso.
          sizes="44px"
          className="object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );
}

export { Avatar, avatarVariants, getInitials, getAvatarColor };
