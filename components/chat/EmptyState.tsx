interface EmptyStateProps {
  onSubmit: (idea: string) => boolean | void | Promise<boolean | void>;
  isLoading: boolean;
}

const EXAMPLE_IDEAS = [
  "Uber for Pets",
  "AI Interview Coach",
  "Healthcare Marketplace",
  "AI Travel Planner",
];

export default function EmptyState({ onSubmit, isLoading }: EmptyStateProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          Evaluate Your Startup Like a VC
        </h1>
        <p className="mt-3 text-base text-text-secondary">
          Get investor-grade feedback powered by AI.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {EXAMPLE_IDEAS.map((idea) => (
          <button
            key={idea}
            type="button"
            onClick={() => onSubmit(idea)}
            disabled={isLoading}
            className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm text-text-secondary transition-colors hover:border-primary/50 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {idea}
          </button>
        ))}
      </div>
    </div>
  );
}
