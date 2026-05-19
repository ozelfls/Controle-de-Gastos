import { CheckCircle2, Clock3, RotateCcw } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { formatSensitiveCurrency } from "../lib/utils";
import { useFinanceStore } from "../stores/useFinanceStore";
import { useSecurityStore } from "../stores/useSecurityStore";

export function Bills() {
  const transactions = useFinanceStore((state) => state.monthTransactions);
  const updateTransactionStatus = useFinanceStore(
    (state) => state.updateTransactionStatus,
  );
  const hideSensitiveValues = useSecurityStore(
    (state) => state.hideSensitiveValues,
  );

  const bills = transactions.filter(
    (transaction) => transaction.type === "bill" || transaction.type === "debt",
  );

  const pendingBills = bills.filter((bill) => bill.status === "pending");
  const paidBills = bills.filter((bill) => bill.status === "paid");
  const pendingTotal = pendingBills.reduce((total, bill) => total + bill.amount, 0);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-border-soft bg-surface p-4">
          <p className="text-sm text-ink-muted">Pendentes</p>
          <strong className="mt-2 block text-2xl font-semibold">
            {pendingBills.length}
          </strong>
        </div>
        <div className="rounded-md border border-border-soft bg-surface p-4">
          <p className="text-sm text-ink-muted">Valor pendente</p>
          <strong className="mt-2 block text-2xl font-semibold">
            {formatSensitiveCurrency(pendingTotal, hideSensitiveValues)}
          </strong>
        </div>
        <div className="rounded-md border border-border-soft bg-surface p-4">
          <p className="text-sm text-ink-muted">Pagas</p>
          <strong className="mt-2 block text-2xl font-semibold">
            {paidBills.length}
          </strong>
        </div>
      </section>

      <section className="rounded-md border border-border-soft bg-surface">
        <div className="border-b border-border-soft p-4">
          <h2 className="text-base font-semibold">Controle de contas</h2>
          <p className="text-sm text-ink-muted">
            Marque compromissos como pagos para atualizar a dashboard.
          </p>
        </div>

        <div className="divide-y divide-border-soft">
          {bills.map((bill) => (
            <article
              className="grid gap-3 p-4 md:grid-cols-[1fr_auto_auto] md:items-center"
              key={bill.id}
            >
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {bill.status === "paid" ? (
                    <CheckCircle2
                      aria-hidden="true"
                      className="h-4 w-4 text-teal-strong"
                    />
                  ) : (
                    <Clock3
                      aria-hidden="true"
                      className="h-4 w-4 text-amber-strong"
                    />
                  )}
                  <h3 className="font-semibold">{bill.description}</h3>
                  <Badge tone={bill.status === "paid" ? "success" : "warning"}>
                    {bill.status === "paid" ? "Pago" : "Pendente"}
                  </Badge>
                  {bill.recurring && <Badge>Recorrente</Badge>}
                </div>
                <p className="text-sm capitalize text-ink-muted">
                  {bill.category} - {new Date(`${bill.date}T00:00:00`).toLocaleDateString("pt-BR")}
                </p>
              </div>

              <strong className="text-lg">
                {formatSensitiveCurrency(bill.amount, hideSensitiveValues)}
              </strong>

              <Button
                onClick={() =>
                  updateTransactionStatus(
                    bill.id,
                    bill.status === "paid" ? "pending" : "paid",
                  )
                }
                type="button"
                variant={bill.status === "paid" ? "secondary" : "primary"}
              >
                {bill.status === "paid" ? (
                  <RotateCcw aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                )}
                {bill.status === "paid" ? "Reabrir" : "Marcar pago"}
              </Button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
