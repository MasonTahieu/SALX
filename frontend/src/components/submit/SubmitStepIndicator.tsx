interface StepDef {
  number: number;
  label: string;
}

interface Props {
  steps: StepDef[];
  current: number;
}

export function SubmitStepIndicator({ steps, current }: Props) {
  return (
    <div className="flex items-center">
      {steps.map((step, i) => (
        <div key={step.number} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={[
                'flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-black transition',
                step.number < current
                  ? 'bg-[var(--sal-primary)] text-white'
                  : step.number === current
                    ? 'bg-[var(--sal-primary)] text-white ring-4 ring-white/20'
                    : 'border border-white/20 bg-white/10 text-white/50',
              ].join(' ')}
            >
              {step.number < current ? '✓' : step.number}
            </div>
            <span
              className={[
                'hidden text-xs font-bold sm:block',
                step.number === current ? 'text-white' : 'text-white/50',
              ].join(' ')}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={[
                'mx-2 h-px w-8 flex-none sm:w-14',
                step.number < current ? 'bg-[var(--sal-primary)]' : 'bg-white/15',
              ].join(' ')}
            />
          )}
        </div>
      ))}
    </div>
  );
}
