import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import { Badge } from "../ui/badge";
import type { Recommendation, RecommendationSeverity } from "../../types/finance";

const iconBySeverity = {
  info: Info,
  warning: AlertTriangle,
  critical: ShieldAlert,
  success: CheckCircle2,
};

const toneBySeverity: Record<
  RecommendationSeverity,
  "neutral" | "success" | "warning" | "danger"
> = {
  info: "neutral",
  warning: "warning",
  critical: "danger",
  success: "success",
};

type RecommendationsPanelProps = {
  recommendations: Recommendation[];
};

export function RecommendationsPanel({
  recommendations,
}: RecommendationsPanelProps) {
  return (
    <section className="rounded-md border border-border-soft bg-surface p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Recomendacoes</h2>
          <p className="text-sm text-ink-muted">Prioridade calculada por regras locais</p>
        </div>
        <Badge tone="success">Offline</Badge>
      </div>

      <div className="space-y-3">
        {recommendations.map((recommendation) => {
          const Icon = iconBySeverity[recommendation.severity];

          return (
            <article
              className="rounded-md border border-border-soft bg-surface-muted p-3"
              key={recommendation.id}
            >
              <div className="flex gap-3">
                <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-teal-strong" />
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold">{recommendation.title}</h3>
                    <Badge tone={toneBySeverity[recommendation.severity]}>
                      Prioridade {recommendation.priority}
                    </Badge>
                  </div>
                  <p className="text-sm leading-6 text-ink-muted">
                    {recommendation.message}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
