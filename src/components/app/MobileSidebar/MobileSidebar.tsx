"use client";

import { Sidebar } from "@/components/app/Sidebar";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/Drawer";

type MobileSidebarProps = Readonly<{
  open: boolean;
  pathname: string;
  onOpenChange: (open: boolean) => void;
}>;

function MobileSidebar({ open, pathname, onOpenChange }: MobileSidebarProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="left">
      <DrawerContent
        showHandle={false}
        className="top-0 right-auto bottom-0 mt-0 h-dvh w-72 rounded-none border-r"
      >
        <DrawerTitle className="sr-only">Menu principal</DrawerTitle>
        <DrawerDescription className="sr-only">
          Navegação principal do FinSight AI.
        </DrawerDescription>
        <Sidebar
          pathname={pathname}
          className="flex h-full w-full flex-col border-r-0 md:hidden lg:flex-row"
          onNavigate={() => onOpenChange(false)}
        />
      </DrawerContent>
    </Drawer>
  );
}

export { MobileSidebar };
