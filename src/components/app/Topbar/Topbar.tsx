"use client";

import { MenuIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/app/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { SearchInput } from "@/components/ui/SearchInput";
import { appRoutes } from "@/routes/app-routes";
import { UserMenu } from "../UserMenu";
import { NotificationsPanel } from "../NotificationsPanel";

type TopbarProps = Readonly<{
  title: string;
  onMenuClick: () => void;
}>;

function Topbar({ title, onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-5">
      <IconButton
        aria-label="Alternar menu"
        variant="ghost"
        onClick={onMenuClick}
      >
        <MenuIcon />
      </IconButton>

      <h1 className="min-w-0 flex-1 truncate text-base font-medium">{title}</h1>

      <div className="hidden w-full max-w-72 lg:block">
        <SearchInput />
      </div>

      <Button
        asChild
        variant="soft"
        size="sm"
        className="hidden sm:inline-flex"
      >
        <Link href={appRoutes.aiChat}>
          <SparklesIcon />
          Perguntar à IA
        </Link>
      </Button>

      <div className="hidden sm:block">
        <ThemeToggle variant="icon" />
      </div>

      <NotificationsPanel />

      <UserMenu />
    </header>
  );
}

export { Topbar };
