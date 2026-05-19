import { Download, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "../components/ui/button";
import { formatSensitiveCurrency } from "../lib/utils";
import { useFinanceStore } from "../stores/useFinanceStore";
import { useSecurityStore } from "../stores/useSecurityStore";

export function Relatorios() {
  const snapshots = useFinanceStore((state) => state.snapshots);
  const transactions = useFinanceStore((state) => state.monthTransactions);
  const hideSensitiveValues = useSecurityStore(
    (state) => state.hideSensitiveValues,
  );

  const categoryData = Object.values(
    transactions
      .filter((transaction) => transaction.type !== "income")
      .reduce<Record<string, { category: string; total: number }>>((acc, transaction) => {
        acc[transaction.category] ??= {
          category: transaction.category,
          total: 0,
        };
        acc[transaction.category].total += transaction.amount;
        return acc;
      }, {}),
  ).sort((a, b) => b.total - a.total);

  const currentSnapshot = snapshots.at(-1);
  const previousSnapshot = snapshots.at(-2);
  const expenseDelta =
    currentSnapshot && previousSnapshot
      ? currentSnapshot.expenses - previousSnapshot.expenses
      : 0;

  function exportCsv() {
    const rows = [
      ["tipo", "categoria", "descricao", "data", "status", "valor"],
      ...transactions.map((transaction) => [
        transaction.type,
        transaction.category,
        transaction.description,
        transaction.date,
        transaction.status ?? "",
        String(transaction.amount),
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "controle-de-gastos-lancamentos.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-5">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-border-soft bg-surface p-4">
          <p className="text-sm text-ink-muted">Mes atual</p>
          <strong className="mt-2 block text-2xl">
            {currentSnapshot?.month ?? "-"}
          </strong>
        </div>
        <div className="rounded-md border border-border-soft bg-surface p-4">
          <p className="text-sm text-ink-muted">Variacao de gastos</p>
          <strong className="mt-2 block text-2xl">
            {formatSensitiveCurrency(expenseDelta, hideSensitiveValues)}
          </strong>
        </div>
        <div className="rounded-md border border-border-soft bg-surface p-4">
          <p className="text-sm text-ink-muted">Lancamentos</p>
          <strong className="mt-2 block text-2xl">{transactions.length}</strong>
        </div>
      </section>

      <section className="rounded-md border border-border-soft bg-surface p-5">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-teal-soft text-teal-strong">
              <TrendingUp aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">Gastos por categoria</h2>
              <p className="text-sm text-ink-muted">
                Ranking calculado a partir dos lancamentos locais.
              </p>
            </div>
          </div>
          <Button onClick={exportCsv} type="button" variant="secondary">
            <Download aria-hidden="true" className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="h-72">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={categoryData} margin={{ left: -16, right: 8 }}>
                <CartesianGrid stroke="#333c43" vertical={false} />
                <XAxis dataKey="category" stroke="#9aa5ad" />
                <YAxis stroke="#9aa5ad" />
                <Tooltip
                  formatter={(value) =>
                    formatSensitiveCurrency(Number(value), hideSensitiveValues)
                  }
                />
                <Bar dataKey="total" fill="#5eead4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="divide-y divide-border-soft rounded-md border border-border-soft bg-surface-muted">
            {categoryData.map((item) => (
              <div
                className="flex items-center justify-between gap-3 p-3 text-sm"
                key={item.category}
              >
                <span className="capitalize text-ink-muted">{item.category}</span>
                <strong>{formatSensitiveCurrency(item.total, hideSensitiveValues)}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function escapeCsvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}
