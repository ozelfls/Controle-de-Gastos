import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { TransactionForm } from "../components/transactions/TransactionForm";
import { TransactionsTable } from "../components/transactions/TransactionsTable";
import { Badge } from "../components/ui/badge";
import { useFinanceStore } from "../stores/useFinanceStore";
import type { BillStatus, Transaction, TransactionType } from "../types/finance";

type TypeFilter = "all" | TransactionType;
type StatusFilter = "all" | BillStatus | "none";

export function Lancamentos() {
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const removeTransaction = useFinanceStore((state) => state.removeTransaction);
  const transactions = useFinanceStore((state) => state.monthTransactions);
  const updateTransaction = useFinanceStore((state) => state.updateTransaction);
  const updateTransactionStatus = useFinanceStore(
    (state) => state.updateTransactionStatus,
  );
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const matchesSearch =
          search.trim().length === 0 ||
          transaction.description.toLowerCase().includes(search.toLowerCase()) ||
          transaction.category.toLowerCase().includes(search.toLowerCase());
        const matchesType =
          typeFilter === "all" ? true : transaction.type === typeFilter;
        const matchesStatus =
          statusFilter === "all"
            ? true
            : statusFilter === "none"
              ? !transaction.status
              : transaction.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
      }),
    [search, statusFilter, transactions, typeFilter],
  );

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4">
      <section className="rounded-md border border-border-soft bg-surface p-4">
        <TransactionForm
          initialTransaction={editingTransaction}
          onCancel={() => setEditingTransaction(null)}
          onSubmit={(input) => {
            if (editingTransaction) {
              updateTransaction(editingTransaction.id, input);
              setEditingTransaction(null);
              return;
            }

            addTransaction(input);
          }}
          submitLabel={editingTransaction ? "Atualizar lancamento" : undefined}
        />
      </section>

      <div className="grid min-h-0 gap-4">
        <section className="rounded-md border border-border-soft bg-surface p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Historico do mes</h2>
              <p className="text-sm text-ink-muted">
                Filtre, edite e acompanhe os registros usados nos indicadores.
              </p>
            </div>
            <Badge>
              {filteredTransactions.length} de {transactions.length}
            </Badge>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_160px_160px]">
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Buscar</span>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
                />
                <input
                  className="h-10 w-full rounded-md border border-border-soft bg-surface-raised pl-9 pr-3 text-ink placeholder:text-ink-muted"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Descricao ou categoria"
                  value={search}
                />
              </div>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Tipo</span>
              <select
                className="h-10 rounded-md border border-border-soft bg-surface-raised px-3 text-ink"
                onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
                value={typeFilter}
              >
                <option value="all">Todos</option>
                <option value="income">Receita</option>
                <option value="expense">Gasto</option>
                <option value="bill">Conta</option>
                <option value="debt">Divida</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Status</span>
              <select
                className="h-10 rounded-md border border-border-soft bg-surface-raised px-3 text-ink"
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                value={statusFilter}
              >
                <option value="all">Todos</option>
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="none">Sem status</option>
              </select>
            </label>
          </div>
        </section>

        <TransactionsTable
          onEdit={setEditingTransaction}
          onRemove={(transactionId) => {
            removeTransaction(transactionId);
            if (editingTransaction?.id === transactionId) {
              setEditingTransaction(null);
            }
          }}
          onStatusChange={updateTransactionStatus}
          transactions={filteredTransactions}
        />
      </div>
    </div>
  );
}
