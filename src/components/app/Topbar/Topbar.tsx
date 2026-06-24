"use client";

import { MenuIcon, SearchIcon } from "lucide-react";
import { useState } from "react";

import { CommandSearch } from "@/components/app/CommandSearch";
import { ThemeToggle } from "@/components/app/ThemeToggle";
import { AIButton } from "@/components/app/AIButton";
import { IconButton } from "@/components/ui/IconButton";
import { SearchInput } from "@/components/ui/SearchInput";
import { appRoutes } from "@/lib/app-routes";
import { UserMenuClient, type UserMenuUser } from "../UserMenu/UserMenuClient";
import { NotificationsPanel } from "../NotificationsPanel";

type TopbarProps = Readonly<{
  title: string;
  onMenuClick: () => void;
  user?: UserMenuUser | null;
}>;

function Topbar({ title, onMenuClick, user }: TopbarProps) {
  const [isCommandSearchOpen, setIsCommandSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-5">
        <IconButton
          aria-label="Alternar menu"
          variant="ghost"
          onClick={onMenuClick}
        >
          <MenuIcon />
        </IconButton>

        <h1 className="min-w-0 flex-1 truncate text-base font-medium">
          {title}
        </h1>

        <div className="hidden w-full max-w-72 lg:block">
          <SearchInput
            readOnly
            onClick={() => setIsCommandSearchOpen(true)}
            onFocus={() => setIsCommandSearchOpen(true)}
          />
        </div>

        <div className="lg:hidden">
          <IconButton
            aria-label="Busca de comandos"
            variant="secondary"
            onClick={() => setIsCommandSearchOpen(true)}
            onFocus={() => setIsCommandSearchOpen(true)}
          >
            <SearchIcon />
          </IconButton>
        </div>

        <AIButton href={appRoutes.aiChat} className="hidden sm:inline-flex" />

        <div className="hidden sm:block">
          <ThemeToggle variant="icon" />
        </div>

        <NotificationsPanel />

        <UserMenuClient user={user} />
      </header>

      <CommandSearch
        open={isCommandSearchOpen}
        onOpenChange={setIsCommandSearchOpen}
      />
    </>
  );
}

export { Topbar };
