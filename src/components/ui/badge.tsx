import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type BadgeTone = "neutral" | "success" | "warning" | "danger";

const tones: Record<BadgeTone, string> = {
  neutral: "border-border-soft bg-surface-muted text-ink-muted",
  success: "border-teal-soft bg-teal-soft text-teal-strong",
  warning: "border-amber-soft bg-amber-soft text-amber-strong",
  danger: "border-ruby-soft bg-ruby-soft text-ruby-strong",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
