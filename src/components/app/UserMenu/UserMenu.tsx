import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { CreditCard, LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function UserMenu() {
  const [open, setOpen] = useState(false);

  function handleOpenChange(next: boolean) {
    setOpen(next);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="hover:bg-transparent">
          <Avatar name="Marina Rocha" size="md" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="flex gap-3 pb-3">
          <Avatar name="Marina Rocha" size="md" />
          <div>
            <p className="text-body font-medium text-foreground">
              Marina Rocha
            </p>
            <p className="text-small text-muted-foreground">
              marina.rocha@email.com
            </p>
          </div>
        </div>
        <Divider className="mb-1.5" />
        <div className="mb-1.5 flex flex-col">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="justify-start text-dense font-normal"
          >
            <Link href="#">
              <UserRound />
              Minha conta
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="justify-start text-dense font-normal"
          >
            <Link href="#">
              <CreditCard />
              Plano e cobrança
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="justify-start text-dense font-normal"
          >
            <Link href="#">
              <Settings />
              Configurações
            </Link>
          </Button>
        </div>
        <Divider className="mb-1.5" />
        <Button
          variant="ghost"
          className="w-full justify-start gap-2.5 text-dense font-normal text-danger hover:bg-danger-soft hover:text-danger"
          size="sm"
        >
          <LogOut />
          Sair da conta
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export { UserMenu };
