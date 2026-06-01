"use client";

import {
  BellIcon,
  ChevronDownIcon,
  DatabaseIcon,
  InfoIcon,
  MoonIcon,
  SparklesIcon,
  WalletIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Divider } from "@/components/ui/Divider";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/Drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { SearchInput } from "@/components/ui/SearchInput";
import { SelectField } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Switch } from "@/components/ui/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardEyebrow,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

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
            <Button variant="soft">Soft</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ai">
              <SparklesIcon />
              Perguntar à IA
            </Button>
            <Button loading>Loading</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          <div className="flex items-center gap-2">
            <IconButton
              aria-label="Notificações"
              onClick={() =>
                toast("Insight salvo", {
                  description: "O toast usa os tokens do tema FinSight.",
                })
              }
            >
              <BellIcon />
            </IconButton>
            <IconButton aria-label="Alternar tema">
              <MoonIcon />
            </IconButton>
            <IconButton
              variant="secondary"
              aria-label="Configurações"
              size="sm"
            >
              <InfoIcon />
            </IconButton>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>IA</Badge>
            <Badge variant="success">Receita</Badge>
            <Badge variant="warning">Atenção</Badge>
            <Badge variant="destructive">Risco</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="outline">Manual</Badge>
            <Badge variant="ai">
              <SparklesIcon />
              AI
            </Badge>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border bg-background p-4 lg:col-span-2">
          <h3 className="text-sm font-medium">Form controls</h3>
          <SearchInput />
          <div className="grid gap-5 md:grid-cols-3">
            <Input
              placeholder="Digite algo..."
              label="Input padrão"
              helperText="Texto de apoio opcional."
            />
            <Input
              placeholder="Campo obrigatório"
              label="Obrigatório"
              required
            />
            <Input
              defaultValue="abc"
              label="Com erro"
              error="Informe um valor válido."
            />
            <Input
              placeholder="0,00"
              label="Valor monetário"
              prefix="R$"
              inputMode="decimal"
            />
            <SelectField
              label="Categoria"
              placeholder="Selecione"
              defaultValue="moradia"
              options={[
                { value: "alimentacao", label: "Alimentação" },
                { value: "moradia", label: "Moradia" },
                { value: "transporte", label: "Transporte" },
              ]}
            />
            <SelectField
              label="Categoria (erro)"
              placeholder="Selecione"
              error="Selecione uma categoria."
              options={[
                { value: "alimentacao", label: "Alimentação" },
                { value: "moradia", label: "Moradia" },
              ]}
            />
            <div className="grid content-start gap-2">
              <span className="text-xs font-medium text-foreground">
                Switch / toggle
              </span>
              <label className="flex items-center gap-3 text-sm text-muted-foreground">
                <Switch defaultChecked />
                Ativado
              </label>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Checkbox label="Recorrente" defaultChecked />
            <Checkbox label="Aceitar termos" error="Campo obrigatório." />
            <Checkbox label="Com helper" helperText="Repete todo mês." />
            <Checkbox label="Desabilitado" disabled />
          </div>
        </div>

        <div className="space-y-4 rounded-lg border bg-background p-4">
          <h3 className="text-sm font-medium">Avatar & Divider</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Avatar name="Marina Rocha" size="lg" />
            <Avatar name="Marina Rocha" size="md" />
            <Avatar name="Marina Rocha" size="sm" />
            <Avatar name="João Silva" size="md" />
            <Avatar name="Ana P" size="md" />
            <Avatar name="" size="md" />
          </div>
          <div className="flex flex-col gap-3">
            <Divider />
            <div className="flex h-8 items-center gap-3">
              <span className="text-xs text-muted-foreground">Horizontal</span>
              <Divider orientation="vertical" />
              <span className="text-xs text-muted-foreground">Vertical</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div>
            <h3 className="text-md font-semibold">Cards</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Contêiner base, métrica e card de IA (tweakável no app).
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card interactive className="min-h-[132px]">
              <CardContent>
                <CardTitle>Card base</CardTitle>
                <CardDescription>
                  Superfície com borda sutil e sombra leve. Aceita hover e
                  clique.
                </CardDescription>
              </CardContent>
            </Card>

            <Card variant="metric" className="min-h-[132px]">
              <CardHeader>
                <CardEyebrow>Saldo total</CardEyebrow>
                <span className="rounded-md bg-muted p-2 text-muted-foreground">
                  <WalletIcon className="size-3.5" aria-hidden="true" />
                </span>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-metric leading-none font-semibold tabular-nums">
                  R$ 14.821
                </p>
                <div className="flex items-end justify-between gap-4">
                  <p className="text-xs font-medium text-success">↗ +4,2%</p>
                  <svg
                    className="h-7 w-20 text-success"
                    viewBox="0 0 80 28"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 16L18 20L28 25L42 8L54 14L68 6L78 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </CardContent>
            </Card>

            <Card variant="ai" className="min-h-[132px]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary p-1.5 text-primary-foreground shadow-card">
                    <SparklesIcon className="size-3" aria-hidden="true" />
                  </span>
                  <CardEyebrow className="text-primary">
                    Análise da IA
                  </CardEyebrow>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-[13px] leading-5 text-card-foreground">
                  Bloco de IA com acento roxo e fonte sempre citada.
                </p>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                <DatabaseIcon
                  className="size-3.5 text-primary"
                  aria-hidden="true"
                />
                Baseado em 28 transações
              </CardFooter>
            </Card>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border bg-background p-4">
          <h3 className="text-sm font-medium">Overlays</h3>
          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">Dialog</Button>
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
                <Button variant="secondary">Drawer</Button>
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
                <Button variant="secondary">
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
                <Button variant="secondary">Popover</Button>
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
                <Button variant="secondary" size="icon" aria-label="Ajuda">
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
