import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { IconButton } from "@/components/ui/IconButton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { BellIcon } from "lucide-react";
import { useState } from "react";

const MOCKED_NOTIFICATIONS = [
  {
    title: "Novo insight disponível",
    text: "3 assinaturas com baixo uso somam R$ 112/mês.",
    hour: "há 2h",
    read: false,
  },
];

function NotificationsPanel() {
  const [open, setOpen] = useState(false);

  function handleOpenChange(next: boolean) {
    setOpen(next);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger>
        <IconButton aria-label="Notificações" variant="secondary">
          <BellIcon />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="end">
        <div>
          <p>Notificações</p>
          <Badge>3 novas</Badge>
          <Button>Marcar lidas</Button>
        </div>
        <Divider />
        <div>{/* Criar componente NotificationItem */}</div>
      </PopoverContent>
    </Popover>
  );
}

export { NotificationsPanel };
