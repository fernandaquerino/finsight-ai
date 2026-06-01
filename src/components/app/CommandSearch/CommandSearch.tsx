"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRightIcon,
  MessageCircleIcon,
  SearchIcon,
  SparklesIcon,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/Dialog";
import { appRoutes, settingsRoute, sidebarRouteGroups } from "@/lib/app-routes";

type CommandSearchProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>;

const pageRoutes = [
  ...sidebarRouteGroups.flatMap((group) => group.routes),
  settingsRoute,
] as const;

function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isCommandSearchShortcut =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";

      if (!isCommandSearchShortcut) return;

      event.preventDefault();
      onOpenChange(true);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onOpenChange]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredPageRoutes = useMemo(() => {
    if (!normalizedQuery) return pageRoutes;

    return pageRoutes.filter((route) =>
      route.label.toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedQuery]);

  const encodedQuery = encodeURIComponent(query.trim());
  const transactionHref = encodedQuery
    ? `${appRoutes.transactions}?q=${encodedQuery}`
    : appRoutes.transactions;
  const aiHref = encodedQuery
    ? `${appRoutes.aiChat}?q=${encodedQuery}`
    : appRoutes.aiChat;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-24 translate-y-0 gap-0 p-0 sm:max-w-2xl">
        <DialogTitle className="sr-only">Busca de comandos</DialogTitle>
        <DialogDescription className="sr-only">
          Busque transações, abra páginas ou pergunte à IA.
        </DialogDescription>

        <div className="flex items-center border-b px-4">
          <SearchIcon
            className="mr-3 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            autoFocus
            value={query}
            placeholder="Buscar transações, páginas ou perguntar à IA..."
            aria-label="Busca de comandos"
            className="h-12 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="max-h-[28rem] overflow-y-auto p-2">
          <div className="py-2">
            <p className="px-3 pb-2 text-[0.6875rem] font-medium tracking-[0.06em] text-muted-foreground uppercase">
              Transações
            </p>
            <CommandSearchLink
              href={transactionHref}
              icon={ArrowLeftRightIcon}
              title={
                query.trim()
                  ? `Buscar "${query.trim()}" em transações`
                  : "Buscar transações"
              }
              description="Descrições, categorias e lançamentos"
              onSelect={() => onOpenChange(false)}
            />
          </div>

          <div className="py-2">
            <p className="px-3 pb-2 text-[0.6875rem] font-medium tracking-[0.06em] text-muted-foreground uppercase">
              Páginas
            </p>
            <div className="space-y-1">
              {filteredPageRoutes.map((route) => (
                <CommandSearchLink
                  key={route.href}
                  href={route.href}
                  icon={route.icon}
                  title={route.label}
                  onSelect={() => onOpenChange(false)}
                />
              ))}
              {filteredPageRoutes.length === 0 && (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  Nenhuma página encontrada
                </p>
              )}
            </div>
          </div>

          <div className="py-2">
            <p className="px-3 pb-2 text-[0.6875rem] font-medium tracking-[0.06em] text-muted-foreground uppercase">
              IA
            </p>
            <CommandSearchLink
              href={aiHref}
              icon={SparklesIcon}
              title={
                query.trim()
                  ? `Perguntar à IA sobre "${query.trim()}"`
                  : "Perguntar à IA"
              }
              description="Abrir chat financeiro"
              trailingIcon={MessageCircleIcon}
              onSelect={() => onOpenChange(false)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type CommandSearchLinkProps = Readonly<{
  href: string;
  icon: typeof SearchIcon;
  title: string;
  description?: string;
  trailingIcon?: typeof SearchIcon;
  onSelect: () => void;
}>;

function CommandSearchLink({
  href,
  icon: Icon,
  title,
  description,
  trailingIcon: TrailingIcon,
  onSelect,
}: CommandSearchLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors outline-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      onClick={onSelect}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-foreground">
          {title}
        </span>
        {description && (
          <span className="block truncate text-xs text-muted-foreground">
            {description}
          </span>
        )}
      </span>
      {TrailingIcon && (
        <TrailingIcon className="size-4 text-muted-foreground" aria-hidden />
      )}
    </Link>
  );
}

export { CommandSearch };
