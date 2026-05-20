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
      {transactions.length === 0 ? (
        <div className="p-6 text-sm text-ink-muted">
          Nenhum lancamento encontrado para os filtros atuais.
        </div>
      ) : (
        <>
          <div className="grid gap-2.5 p-3 lg:hidden">
            {transactions.map((transaction) => (
              <article
                className="rounded-md border border-border-soft bg-surface-raised p-3"
                key={transaction.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">
                      {transaction.description}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                      <Badge>{typeLabels[transaction.type]}</Badge>
                      <span className="capitalize">{transaction.category}</span>
                      <span>
                        {new Date(`${transaction.date}T00:00:00`).toLocaleDateString(
                          "pt-BR",
                        )}
                      </span>
                    </div>
                  </div>
                  <strong className="shrink-0 text-sm">
                    {formatSensitiveCurrency(
                      transaction.amount,
                      hideSensitiveValues,
                    )}
                  </strong>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div>
                    {transaction.status ? (
                      <Badge
                        tone={transaction.status === "paid" ? "success" : "warning"}
                      >
                        {transaction.status === "paid" ? "Pago" : "Pendente"}
                      </Badge>
                    ) : (
                      <span className="text-xs text-ink-muted">Sem status</span>
                    )}
                  </div>
                  {(onEdit || onRemove || onStatusChange) && (
                    <ActionButtons
                      onEdit={onEdit}
                      onRemove={onRemove}
                      onStatusChange={onStatusChange}
                      transaction={transaction}
                    />
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="hidden max-h-[54vh] overflow-y-auto lg:block">
            <table className="w-full table-fixed border-collapse text-left text-sm">
              <thead className="sticky top-0 z-[1] bg-surface-muted text-xs uppercase text-ink-muted">
                <tr>
                  <th className="w-[26%] px-4 py-3 font-semibold">Descricao</th>
                  <th className="w-[12%] px-4 py-3 font-semibold">Tipo</th>
                  <th className="w-[14%] px-4 py-3 font-semibold">Categoria</th>
                  <th className="w-[13%] px-4 py-3 font-semibold">Data</th>
                  <th className="w-[13%] px-4 py-3 font-semibold">Status</th>
                  <th className="w-[12%] px-4 py-3 text-right font-semibold">
                    Valor
                  </th>
                  {(onEdit || onRemove || onStatusChange) && (
                    <th className="w-[10%] px-4 py-3 text-right font-semibold">
                      Acoes
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    className="border-t border-border-soft transition-colors hover:bg-surface-muted"
                    key={transaction.id}
                  >
                    <td className="truncate px-4 py-3 font-medium">
                      {transaction.description}
                    </td>
                    <td className="px-4 py-3">{typeLabels[transaction.type]}</td>
                    <td className="truncate px-4 py-3 capitalize">
                      {transaction.category}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(`${transaction.date}T00:00:00`).toLocaleDateString(
                        "pt-BR",
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {transaction.status ? (
                        <Badge
                          tone={
                            transaction.status === "paid" ? "success" : "warning"
                          }
                        >
                          {transaction.status === "paid" ? "Pago" : "Pendente"}
                        </Badge>
                      ) : (
                        <span className="text-ink-muted">-</span>
                      )}
                    </td>
                    <td className="truncate px-4 py-3 text-right font-semibold">
                      {formatSensitiveCurrency(
                        transaction.amount,
                        hideSensitiveValues,
                      )}
                    </td>
                    {(onEdit || onRemove || onStatusChange) && (
                      <td className="px-4 py-3">
                        <ActionButtons
                          onEdit={onEdit}
                          onRemove={onRemove}
                          onStatusChange={onStatusChange}
                          transaction={transaction}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function ActionButtons({
  onEdit,
  onRemove,
  onStatusChange,
  transaction,
}: {
  onEdit?: (transaction: Transaction) => void;
  onRemove?: (transactionId: string) => void;
  onStatusChange?: (transactionId: string, status: BillStatus) => void;
  transaction: Transaction;
}) {
  return (
    <div className="flex shrink-0 justify-end gap-2">
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
  );
}
