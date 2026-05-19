import { AlertTriangle, ClipboardList, PiggyBank, Wallet } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { formatPercent, formatSensitiveCurrency } from "../lib/utils";
import { useFinanceStore } from "../stores/useFinanceStore";
import { useSecurityStore } from "../stores/useSecurityStore";

export function Planejamento() {
  const indicators = useFinanceStore((state) => state.indicators);
  const hideSensitiveValues = useSecurityStore(
    (state) => state.hideSensitiveValues,
  );

  const suggestedReserve = Math.max(indicators.expectedSurplus * 0.35, 0);
  const suggestedDebtPayment = Math.max(indicators.expectedSurplus * 0.3, 0);
  const suggestedFlexible = Math.max(indicators.expectedSurplus * 0.35, 0);
  const fixedPressure =
    indicators.monthlyIncome > 0
      ? indicators.totalExpenses / indicators.monthlyIncome
      : 0;

  const planStatus =
    indicators.expectedSurplus <= 0
      ? "Ajuste necessario"
      : fixedPressure > 0.8
        ? "Pressao alta"
        : "Operando com folga";

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-5 xl:grid-cols-[1fr_380px]">
      <section className="rounded-md border border-border-soft bg-surface p-5">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Plano mensal</h2>
            <p className="text-sm text-ink-muted">
              Projecao baseada nos lancamentos atuais e regras locais.
            </p>
          </div>
          <Badge
            tone={
              indicators.expectedSurplus <= 0
                ? "danger"
                : fixedPressure > 0.8
                  ? "warning"
                  : "success"
            }
          >
            {planStatus}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-md border border-border-soft bg-surface-muted p-4">
            <p className="text-sm text-ink-muted">Sobra prevista</p>
            <strong className="mt-2 block text-2xl">
              {formatSensitiveCurrency(indicators.expectedSurplus, hideSensitiveValues)}
            </strong>
          </div>
          <div className="rounded-md border border-border-soft bg-surface-muted p-4">
            <p className="text-sm text-ink-muted">Gasto diario seguro</p>
            <strong className="mt-2 block text-2xl">
              {formatSensitiveCurrency(indicators.safeDailySpend, hideSensitiveValues)}
            </strong>
          </div>
          <div className="rounded-md border border-border-soft bg-surface-muted p-4">
            <p className="text-sm text-ink-muted">Pressao de gastos</p>
            <strong className="mt-2 block text-2xl">
              {formatPercent(fixedPressure)}
            </strong>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <AllocationRow
            amount={suggestedReserve}
            hideSensitiveValues={hideSensitiveValues}
            icon={PiggyBank}
            label="Reserva"
            percent={0.35}
          />
          <AllocationRow
            amount={suggestedDebtPayment}
            hideSensitiveValues={hideSensitiveValues}
            icon={AlertTriangle}
            label="Dividas e contas pendentes"
            percent={0.3}
          />
          <AllocationRow
            amount={suggestedFlexible}
            hideSensitiveValues={hideSensitiveValues}
            icon={Wallet}
            label="Uso flexivel"
            percent={0.35}
          />
        </div>
      </section>

      <aside className="rounded-md border border-border-soft bg-surface p-5">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-teal-soft text-teal-strong">
          <ClipboardList aria-hidden="true" className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold">Acao recomendada agora</h2>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          {indicators.pendingBills > 0
            ? "Quite ou reprograme as contas pendentes antes de aumentar gastos variaveis."
            : "Com as contas em dia, direcione a sobra para reserva e metas prioritarias."}
        </p>
        <div className="mt-5 rounded-md border border-border-soft bg-surface-muted p-4">
          <p className="text-sm font-medium">Reserva atual estimada</p>
          <p className="mt-1 text-2xl font-semibold">
            {indicators.reserveInMonths.toFixed(1)} meses
          </p>
        </div>
      </aside>
    </div>
  );
}

type AllocationRowProps = {
  amount: number;
  hideSensitiveValues: boolean;
  icon: typeof PiggyBank;
  label: string;
  percent: number;
};

function AllocationRow({
  amount,
  hideSensitiveValues,
  icon: Icon,
  label,
  percent,
}: AllocationRowProps) {
  return (
    <div className="grid gap-3 rounded-md border border-border-soft bg-surface-muted p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-raised text-teal-strong">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-ink-muted">
          Sugestao: {formatPercent(percent)} da sobra positiva
        </p>
      </div>
      <strong>{formatSensitiveCurrency(amount, hideSensitiveValues)}</strong>
    </div>
  );
}
