import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  paid: "bg-sand text-primary ring-primary/10",
  shipped: "bg-primary/10 text-primary ring-primary/15",
  delivered: "bg-primary text-primary-foreground ring-primary/20",
  cancelled: "bg-muted text-muted-foreground ring-border",
  succeeded: "bg-primary/10 text-primary ring-primary/15",
  refunded: "bg-muted text-muted-foreground ring-border",
  "in stock": "bg-primary/10 text-primary ring-primary/15",
  "low stock": "bg-sand text-primary ring-primary/10",
  "sold out": "bg-muted text-muted-foreground ring-border",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ring-1",
        TONES[status] ?? "bg-muted text-muted-foreground ring-border",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
