import { CheckCircle2, Gauge, PiggyBank, ShieldAlert } from "lucide-react";
import { strategyPacks } from "../data/strategyPacks";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { formatPercent } from "../lib/utils";
import { useFinanceStore } from "../stores/useFinanceStore";
import type { StrategyAggressiveness } from "../types/strategy";

const aggressivenessOptions: {
  label: string;
  value: StrategyAggressiveness;
  description: string;
}[] = [
  {
    label: "Baixa",
    value: "low",
    description: "Preserva caixa e reduz risco.",
  },
  {
    label: "Media",
    value: "medium",
    description: "Equilibra seguranca e crescimento.",
  },
  {
    label: "Alta",
    value: "high",
    description: "Prioriza metas agressivas com mais oscilacao.",
  },
];

export function Estrategias() {
  const activeStrategyPackIds = useFinanceStore(
    (state) => state.activeStrategyPackIds,
  );
  const setStrategyAggressiveness = useFinanceStore(
    (state) => state.setStrategyAggressiveness,
  );
  const strategyAggressiveness = useFinanceStore(
    (state) => state.strategyAggressiveness,
  );
  const toggleStrategyPack = useFinanceStore((state) => state.toggleStrategyPack);

  const activePacks = strategyPacks.filter((pack) =>
    activeStrategyPackIds.includes(pack.id),
  );

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-5 xl:grid-cols-[1fr_360px]">
      <section className="rounded-md border border-border-soft bg-surface p-5">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-teal-soft text-teal-strong">
            <PiggyBank aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Packs de estrategia</h2>
            <p className="text-sm text-ink-muted">
              Ative packs para direcionar a interpretacao financeira local.
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {strategyPacks.map((pack) => {
            const isActive = activeStrategyPackIds.includes(pack.id);

            return (
              <article
                className="rounded-md border border-border-soft bg-surface-muted p-4"
                key={pack.id}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{pack.name}</h3>
                    <p className="mt-1 text-sm text-ink-muted">
                      Prioridade {pack.priority}
                    </p>
                  </div>
                  <Badge tone={isActive ? "success" : "neutral"}>
                    {isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                <p className="min-h-12 text-sm leading-6 text-ink-muted">
                  {pack.messages[0]}
                </p>

                <div className="mt-4 grid gap-2 text-sm">
                  {Object.entries(pack.allocations).map(([key, value]) => (
                    <div className="flex justify-between gap-3" key={key}>
                      <span className="text-ink-muted">{allocationLabel(key)}</span>
                      <strong>{formatPercent(Number(value))}</strong>
                    </div>
                  ))}
                </div>

                <Button
                  className="mt-4 w-full"
                  onClick={() => toggleStrategyPack(pack.id)}
                  type="button"
                  variant={isActive ? "secondary" : "primary"}
                >
                  {isActive ? (
                    <ShieldAlert aria-hidden="true" className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                  )}
                  {isActive ? "Desativar" : "Ativar"}
                </Button>
              </article>
            );
          })}
        </div>
      </section>

      <aside className="rounded-md border border-border-soft bg-surface p-5">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-teal-soft text-teal-strong">
          <Gauge aria-hidden="true" className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold">Agressividade</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Define o tom das sugestoes, sem permitir decisoes automaticas.
        </p>

        <div className="mt-5 grid gap-2">
          {aggressivenessOptions.map((option) => (
            <button
              className={`rounded-md border p-3 text-left transition-colors ${
                strategyAggressiveness === option.value
                  ? "border-teal-strong bg-teal-soft"
                  : "border-border-soft bg-surface-muted hover:bg-surface-raised"
              }`}
              key={option.value}
              onClick={() => setStrategyAggressiveness(option.value)}
              type="button"
            >
              <span className="block text-sm font-semibold">{option.label}</span>
              <span className="mt-1 block text-sm text-ink-muted">
                {option.description}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-md border border-border-soft bg-surface-muted p-4">
          <p className="text-sm font-medium">Packs ativos</p>
          <p className="mt-1 text-2xl font-semibold">{activePacks.length}</p>
        </div>
      </aside>
    </div>
  );
}

function allocationLabel(key: string) {
  const labels: Record<string, string> = {
    reserve: "Reserva",
    debtPayment: "Dividas",
    flexibleSpend: "Flexivel",
    investments: "Investimentos",
    essentialBills: "Essenciais",
  };

  return labels[key] ?? key;
}
