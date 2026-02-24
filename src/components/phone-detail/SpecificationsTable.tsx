interface Spec {
  label: string;
  value: string;
}

interface SpecificationsTableProps {
  specs: Spec[];
}

export function SpecificationsTable({ specs }: SpecificationsTableProps) {
  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-base">All Details</h2>
      <div className="rounded-xl border border-border/50 overflow-hidden">
        {specs.map((spec, i) => (
          <div key={spec.label} className={`flex gap-4 px-4 py-3 text-sm ${i % 2 === 0 ? 'bg-secondary/30' : 'bg-background'}`}>
            <span className="text-muted-foreground w-28 shrink-0">{spec.label}</span>
            <span className="font-medium break-words min-w-0">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
