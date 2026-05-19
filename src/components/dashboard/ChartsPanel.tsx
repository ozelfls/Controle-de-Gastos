import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FinancialSnapshot, Transaction } from "../../types/finance";

const colors = ["#0f766e", "#a15c07", "#b42318", "#52616b", "#68707d"];

type ChartsPanelProps = {
  transactions: Transaction[];
  snapshots: FinancialSnapshot[];
};

export function ChartsPanel({ transactions, snapshots }: ChartsPanelProps) {
  const categoryData = Object.values(
    transactions
      .filter((transaction) => transaction.type !== "income")
      .reduce<Record<string, { name: string; value: number }>>((acc, transaction) => {
        acc[transaction.category] ??= {
          name: transaction.category,
          value: 0,
        };
        acc[transaction.category].value += transaction.amount;
        return acc;
      }, {}),
  );

  const billData = [
    {
      name: "Pagas",
      value: transactions.filter((transaction) => transaction.status === "paid").length,
    },
    {
      name: "Pendentes",
      value: transactions.filter((transaction) => transaction.status === "pending").length,
    },
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
      <section className="rounded-md border border-border-soft bg-surface p-4">
        <div className="mb-4">
          <h2 className="text-base font-semibold">Gastos por categoria</h2>
          <p className="text-sm text-ink-muted">Distribuicao do mes atual</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer height="100%" width="100%">
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                innerRadius={58}
                nameKey="name"
                outerRadius={90}
                paddingAngle={2}
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    fill={colors[index % colors.length]}
                    key={`category-${entry.name}`}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-md border border-border-soft bg-surface p-4">
        <div className="mb-4">
          <h2 className="text-base font-semibold">Evolucao financeira</h2>
          <p className="text-sm text-ink-muted">Receitas, gastos e reserva</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={snapshots} margin={{ left: -16, right: 8 }}>
              <CartesianGrid stroke="#333c43" vertical={false} />
              <XAxis dataKey="month" stroke="#9aa5ad" />
              <YAxis stroke="#9aa5ad" />
              <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
              <Line dataKey="income" name="Receita" stroke="#0f766e" strokeWidth={2} />
              <Line dataKey="expenses" name="Gastos" stroke="#b42318" strokeWidth={2} />
              <Line dataKey="reserve" name="Reserva" stroke="#52616b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-md border border-border-soft bg-surface p-4 xl:col-span-2">
        <div className="mb-4">
          <h2 className="text-base font-semibold">Contas pagas e pendentes</h2>
          <p className="text-sm text-ink-muted">Status operacional do mes</p>
        </div>
        <div className="h-56">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={billData} margin={{ left: -16, right: 8 }}>
              <CartesianGrid stroke="#333c43" vertical={false} />
              <XAxis dataKey="name" stroke="#9aa5ad" />
              <YAxis allowDecimals={false} stroke="#9aa5ad" />
              <Tooltip />
              <Bar dataKey="value" fill="#0f766e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
