import { cn } from "@/lib/utils";

type OnboardingProgressProps = Readonly<{
  currentStep: number; // 1-based
  totalSteps: number;
  stepLabel: string;
}>;

export function OnboardingProgress({
  currentStep,
  totalSteps,
  stepLabel,
}: OnboardingProgressProps) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex gap-1.5"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuenow={currentStep}
        aria-label={`Passo ${currentStep} de ${totalSteps}: ${stepLabel}`}
      >
        {Array.from({ length: totalSteps }, (_, index) => (
          <span
            key={index}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              index < currentStep ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          Passo {currentStep} de {totalSteps}
        </p>
        <p className="text-sm text-muted-foreground">{stepLabel}</p>
      </div>
    </div>
  );
}
