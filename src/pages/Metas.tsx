import { Flag, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { formatPercent, formatSensitiveCurrency } from "../lib/utils";
import { useFinanceStore } from "../stores/useFinanceStore";
import { useSecurityStore } from "../stores/useSecurityStore";

export function Metas() {
  const addGoalContribution = useFinanceStore((state) => state.addGoalContribution);
  const goals = useFinanceStore((state) => state.goals);
  const hideSensitiveValues = useSecurityStore(
    (state) => state.hideSensitiveValues,
  );
  const [amountByGoal, setAmountByGoal] = useState<Record<string, string>>({});

  function handleContribution(goalId: string) {
    const amount = Number(amountByGoal[goalId] ?? 0);

    if (amount > 0) {
      addGoalContribution(goalId, amount);
      setAmountByGoal((current) => ({ ...current, [goalId]: "" }));
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5">
      <section className="rounded-md border border-border-soft bg-surface p-5">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-teal-soft text-teal-strong">
            <Flag aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Metas financeiras</h2>
            <p className="text-sm text-ink-muted">
              Acompanhe reserva, quitacao de dividas e objetivos importantes.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {goals.map((goal) => {
            const progress =
              goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
            const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);

            return (
              <article
                className="rounded-md border border-border-soft bg-surface-muted p-4"
                key={goal.id}
              >
                <div className="grid gap-4 lg:grid-cols-[1fr_300px] lg:items-end">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-semibold">{goal.name}</h3>
                      <span className="text-sm text-ink-muted">
                        {formatPercent(progress)}
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-md bg-surface-raised">
                      <div
                        className="h-full rounded-md bg-teal-strong"
                        style={{ width: `${Math.min(progress * 100, 100)}%` }}
                      />
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-ink-muted sm:grid-cols-3">
                      <span>
                        Atual:{" "}
                        {formatSensitiveCurrency(goal.currentAmount, hideSensitiveValues)}
                      </span>
                      <span>
                        Meta:{" "}
                        {formatSensitiveCurrency(goal.targetAmount, hideSensitiveValues)}
                      </span>
                      <span>
                        Falta: {formatSensitiveCurrency(remaining, hideSensitiveValues)}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <label className="grid gap-1 text-sm">
                      <span className="font-medium">Aporte</span>
                      <input
                        className="h-10 rounded-md border border-border-soft bg-surface-raised px-3 text-ink placeholder:text-ink-muted"
                        inputMode="decimal"
                        onChange={(event) =>
                          setAmountByGoal((current) => ({
                            ...current,
                            [goal.id]: event.target.value,
                          }))
                        }
                        placeholder="0,00"
                        type="number"
                        value={amountByGoal[goal.id] ?? ""}
                      />
                    </label>
                    <Button
                      className="self-end"
                      onClick={() => handleContribution(goal.id)}
                      type="button"
                    >
                      <Plus aria-hidden="true" className="h-4 w-4" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
