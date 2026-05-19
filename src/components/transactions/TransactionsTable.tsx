import { CheckCircle2, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { formatSensitiveCurrency } from "../../lib/utils";
import { useSecurityStore } from "../../stores/useSecurityStore";
import type { BillStatus } from "../../types/finance";
import type { Transaction } from "../../types/finance";

const typeLabels: Record<Transaction["type"], string> = {
  income: "Receita",
  expense: "Gasto",
  bill: "Conta",
  debt: "Divida",
};

type TransactionsTableProps = {
  onEdit?: (transaction: Transaction) => void;
  onRemove?: (transactionId: string) => void;
  onStatusChange?: (transactionId: string, status: BillStatus) => void;
  transactions: Transaction[];
};

export function TransactionsTable({
  onEdit,
  onRemove,
  onStatusChange,
  transactions,
}: TransactionsTableProps) {
  const hideSensitiveValues = useSecurityStore(
    (state) => state.hideSensitiveValues,
  );

  return (
    <section className="rounded-md border border-border-soft bg-surface">
      <div className="border-b border-border-soft p-4">
        <h2 className="text-base font-semibold">Historico do mes</h2>
        <p className="text-sm text-ink-muted">Lancamentos usados nos indicadores.</p>
      </div>

      {transactions.length === 0 ? (
        <div className="p-6 text-sm text-ink-muted">
          Nenhum lancamento encontrado para os filtros atuais.
        </div>
      ) : (
        <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead className="bg-surface-muted text-xs uppercase text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Descricao</th>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              <th className="px-4 py-3 font-semibold">Categoria</th>
              <th className="px-4 py-3 font-semibold">Data</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Valor</th>
              {(onEdit || onRemove || onStatusChange) && (
                <th className="px-4 py-3 text-right font-semibold">Acoes</th>
              )}
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr className="border-t border-border-soft" key={transaction.id}>
                <td className="px-4 py-3 font-medium">{transaction.description}</td>
                <td className="px-4 py-3">{typeLabels[transaction.type]}</td>
                <td className="px-4 py-3 capitalize">{transaction.category}</td>
                <td className="px-4 py-3">
                  {new Date(`${transaction.date}T00:00:00`).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3">
                  {transaction.status ? (
                    <Badge tone={transaction.status === "paid" ? "success" : "warning"}>
                      {transaction.status === "paid" ? "Pago" : "Pendente"}
                    </Badge>
                  ) : (
                    <span className="text-ink-muted">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  {formatSensitiveCurrency(transaction.amount, hideSensitiveValues)}
                </td>
                {(onEdit || onRemove || onStatusChange) && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {onEdit && (
                        <Button
                          aria-label="Editar lancamento"
                          onClick={() => onEdit(transaction)}
                          size="icon"
                          type="button"
                          variant="secondary"
                        >
                          <Pencil aria-hidden="true" className="h-4 w-4" />
                        </Button>
                      )}
                      {onStatusChange && transaction.status && (
                        <Button
                          aria-label={
                            transaction.status === "paid"
                              ? "Marcar como pendente"
                              : "Marcar como pago"
                          }
                          onClick={() =>
                            onStatusChange(
                              transaction.id,
                              transaction.status === "paid" ? "pending" : "paid",
                            )
                          }
                          size="icon"
                          type="button"
                          variant="secondary"
                        >
                          {transaction.status === "paid" ? (
                            <RotateCcw aria-hidden="true" className="h-4 w-4" />
                          ) : (
                            <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      {onRemove && (
                        <Button
                          aria-label="Remover lancamento"
                          onClick={() => onRemove(transaction.id)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 aria-hidden="true" className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </section>
  );
}
