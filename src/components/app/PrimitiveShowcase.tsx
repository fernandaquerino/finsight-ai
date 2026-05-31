"use client";

import { BellIcon, ChevronDownIcon, InfoIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/Button";

export function PrimitiveShowcase() {
  return (
    <section className="mt-8 rounded-xl border bg-card p-6 text-card-foreground">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-medium tracking-[0.06em] text-muted-foreground uppercase">
            shadcn/ui smoke test
          </p>
          <h2 className="text-md font-medium">Primitivos FinSight</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Componentes base usando as variáveis de tema, foco acessível e
            suporte a dark mode.
          </p>
        </div>
        <Badge variant="secondary">Dark mode ready</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border bg-background p-4">
          <h3 className="text-sm font-medium">Actions & feedback</h3>
          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button loading>Loading</Button>
            <Button variant="destructive">Destructive</Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Notifications"
              onClick={() =>
                toast("Insight salvo", {
                  description: "O toast usa os tokens do tema FinSight.",
                })
              }
            >
              <BellIcon />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>IA</Badge>
            <Badge variant="success">Receita</Badge>
            <Badge variant="warning">Atenção</Badge>
            <Badge variant="destructive">Risco</Badge>
            <Badge variant="outline">Manual</Badge>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border bg-background p-4">
          <h3 className="text-sm font-medium">Form controls</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm">
              Conta
              <Input placeholder="Conta principal" />
            </label>
            <label className="grid gap-1.5 text-sm">
              Categoria
              <Select defaultValue="moradia">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alimentacao">Alimentação</SelectItem>
                  <SelectItem value="moradia">Moradia</SelectItem>
                  <SelectItem value="transporte">Transporte</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox defaultChecked />
              Recorrente
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch defaultChecked />
              Alertas
            </label>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border bg-background p-4">
          <h3 className="text-sm font-medium">Overlays</h3>
          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar sugestão</DialogTitle>
                  <DialogDescription>
                    Sugestões de IA precisam de confirmação antes de alterar
                    dados financeiros.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="secondary">Revisar</Button>
                  <Button>Confirmar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline">Drawer</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Detalhe da transação</DrawerTitle>
                  <DrawerDescription>
                    Padrão mobile para detalhes e ações contextuais.
                  </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <Button>Salvar</Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Menu
                  <ChevronDownIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Editar categoria</DropdownMenuItem>
                <DropdownMenuItem>Exportar CSV</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Popover</Button>
              </PopoverTrigger>
              <PopoverContent>
                <p className="text-sm font-medium">Insight contextual</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Popovers usam superfície `popover` e borda do tema.
                </p>
              </PopoverContent>
            </Popover>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Ajuda">
                  <InfoIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Tooltip tokenizado</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border bg-background p-4">
          <h3 className="text-sm font-medium">Navigation & loading</h3>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Resumo</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="rounded-md border p-3">
              <p className="text-sm text-muted-foreground">
                Tabs mantêm foco visível e contraste em light/dark.
              </p>
            </TabsContent>
            <TabsContent value="insights" className="rounded-md border p-3">
              <p className="text-sm text-muted-foreground">
                Área reservada para insights acionáveis.
              </p>
            </TabsContent>
          </Tabs>
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
