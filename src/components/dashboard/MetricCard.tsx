import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

type MetricTone = "neutral" | "success" | "warning" | "danger";

const toneStyles: Record<MetricTone, string> = {
  neutral: "bg-surface-raised text-ink",
  success: "bg-teal-soft text-teal-strong",
  warning: "bg-amber-soft text-amber-strong",
  danger: "bg-ruby-soft text-ruby-strong",
};

type MetricCardProps = {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: MetricTone;
};

export function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "neutral",
}: MetricCardProps) {
  return (
    <section className="rounded-md border border-border-soft bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-ink-muted">{title}</p>
          <strong className="mt-2 block truncate text-2xl font-semibold text-ink">
            {value}
          </strong>
        </div>
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
            toneStyles[tone],
          )}
        >
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-sm text-ink-muted">{detail}</p>
    </section>
  );
}
