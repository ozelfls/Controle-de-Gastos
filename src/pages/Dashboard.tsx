import {
  Activity,
  Banknote,
  CalendarCheck2,
  CalendarClock,
  CircleDollarSign,
  HeartPulse,
  WalletCards,
} from "lucide-react";
import { ChartsPanel } from "../components/dashboard/ChartsPanel";
import { MetricCard } from "../components/dashboard/MetricCard";
import { RecommendationsPanel } from "../components/dashboard/RecommendationsPanel";
import { formatSensitiveCurrency } from "../lib/utils";
import { useSecurityStore } from "../stores/useSecurityStore";
import { useFinanceStore } from "../stores/useFinanceStore";

export function Dashboard() {
  const {
    indicators,
    monthTransactions,
    recommendations,
    snapshots,
  } = useFinanceStore();
  const hideSensitiveValues = useSecurityStore(
    (state) => state.hideSensitiveValues,
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          detail="Entradas registradas no mes"
          icon={Banknote}
          title="Receita do mes"
          tone="success"
          value={formatSensitiveCurrency(indicators.monthlyIncome, hideSensitiveValues)}
        />
        <MetricCard
          detail="Gastos, contas e dividas"
          icon={WalletCards}
          title="Gastos totais"
          tone="danger"
          value={formatSensitiveCurrency(indicators.totalExpenses, hideSensitiveValues)}
        />
        <MetricCard
          detail="Ainda exigem acao"
          icon={CalendarClock}
          title="Contas pendentes"
          tone="warning"
          value={String(indicators.pendingBills)}
        />
        <MetricCard
          detail="Compromissos resolvidos"
          icon={CalendarCheck2}
          title="Contas pagas"
          tone="neutral"
          value={String(indicators.paidBills)}
        />
        <MetricCard
          detail="Antes de novos objetivos"
          icon={CircleDollarSign}
          title="Sobra prevista"
          tone="success"
          value={formatSensitiveCurrency(indicators.expectedSurplus, hideSensitiveValues)}
        />
        <MetricCard
          detail="Media segura ate virar o mes"
          icon={Activity}
          title="Gasto diario seguro"
          tone="neutral"
          value={formatSensitiveCurrency(indicators.safeDailySpend, hideSensitiveValues)}
        />
        <MetricCard
          detail="Score interno de estabilidade"
          icon={HeartPulse}
          title="Saude financeira"
          tone={indicators.financialHealthScore >= 70 ? "success" : "warning"}
          value={`${indicators.financialHealthScore}/100`}
        />
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <ChartsPanel snapshots={snapshots} transactions={monthTransactions} />
        <RecommendationsPanel recommendations={recommendations} />
      </div>
    </div>
  );
}
