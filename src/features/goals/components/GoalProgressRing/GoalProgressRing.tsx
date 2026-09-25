import { GoalIcon, type GoalIconKey } from "@/lib/goals";
import { cn } from "@/lib/utils";

type GoalProgressRingProps = Readonly<{
  // 0..1+ — acima de 1 o anel fica completo (a meta foi superada).
  progress: number;
  iconKey: GoalIconKey;
  // Classe utilitária de cor aplicada ao traço e ao ícone (ex.: "text-success").
  toneClassName: string;
  size?: number;
  className?: string;
}>;

const STROKE = 6;

// Anel de progresso decorativo (aria-hidden): a mesma informação está no texto
// ao lado, com porcentagem e valores. Não é um progressbar acessível de
// propósito — duplicar a semântica faria o leitor de tela ler o dado duas vezes.
function GoalProgressRing({
  progress,
  iconKey,
  toneClassName,
  size = 64,
  className,
}: GoalProgressRingProps) {
  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = Math.min(1, Math.max(0, progress));

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - filled)}
          className={cn(
            "transition-[stroke-dashoffset] duration-500 ease-out",
            toneClassName,
          )}
          style={{ stroke: "currentColor" }}
        />
      </svg>
      <span
        className={cn(
          "absolute inset-0 grid place-items-center",
          toneClassName,
        )}
      >
        <GoalIcon iconKey={iconKey} className="size-[22px]" />
      </span>
    </div>
  );
}

export { GoalProgressRing };
