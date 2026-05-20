import { Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import type {
  BillStatus,
  FinancialCategory,
  NewTransactionInput,
  Transaction,
  TransactionType,
} from "../../types/finance";
import { transactionSchema } from "../../validation/finance";

const transactionTypes: { label: string; value: TransactionType }[] = [
  { label: "Receita", value: "income" },
  { label: "Gasto", value: "expense" },
  { label: "Conta", value: "bill" },
  { label: "Divida", value: "debt" },
];

const categories: { label: string; value: FinancialCategory }[] = [
  { label: "Moradia", value: "moradia" },
  { label: "Alimentacao", value: "alimentacao" },
  { label: "Transporte", value: "transporte" },
  { label: "Lazer", value: "lazer" },
  { label: "Saude", value: "saude" },
  { label: "Educacao", value: "educacao" },
  { label: "Reserva", value: "reserva" },
  { label: "Renda", value: "renda" },
  { label: "Dividas", value: "dividas" },
];

type TransactionFormProps = {
  initialTransaction?: Transaction | null;
  onCancel?: () => void;
  onSubmit: (input: NewTransactionInput) => void;
  submitLabel?: string;
};

type FormState = {
  type: TransactionType;
  category: FinancialCategory;
  description: string;
  amount: string;
  date: string;
  recurring: boolean;
  status: BillStatus;
};

const initialFormState: FormState = {
  type: "expense",
  category: "alimentacao",
  description: "",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  recurring: false,
  status: "pending",
};

function transactionToFormState(transaction: Transaction): FormState {
  return {
    type: transaction.type,
    category: transaction.category,
    description: transaction.description,
    amount: String(transaction.amount),
    date: transaction.date,
    recurring: transaction.recurring,
    status: transaction.status ?? "pending",
  };
}

export function TransactionForm({
  initialTransaction,
  onCancel,
  onSubmit,
  submitLabel,
}: TransactionFormProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(
      initialTransaction ? transactionToFormState(initialTransaction) : initialFormState,
    );
    setError(null);
  }, [initialTransaction]);

  const requiresStatus = useMemo(
    () => form.type === "bill" || form.type === "debt",
    [form.type],
  );

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = transactionSchema.safeParse({
      ...form,
      amount: Number(form.amount),
      status: requiresStatus ? form.status : undefined,
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Revise os campos informados.");
      return;
    }

    onSubmit(result.data);
    if (!initialTransaction) {
      setForm(initialFormState);
    }
    setError(null);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
        <h2 className="text-base font-semibold">Novo lancamento</h2>
        <p className="text-sm text-ink-muted">
          {initialTransaction
            ? "Atualize um registro existente."
            : "Registro local para alimentar indicadores e recomendacoes."}
        </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[140px_170px_minmax(220px,1fr)_140px_145px_140px_130px]">
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Tipo</span>
          <select
            className="h-10 rounded-md border border-border-soft bg-surface-raised px-3 text-ink"
            onChange={(event) =>
              updateForm("type", event.target.value as TransactionType)
            }
            value={form.type}
          >
            {transactionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Categoria</span>
          <select
            className="h-10 rounded-md border border-border-soft bg-surface-raised px-3 text-ink"
            onChange={(event) =>
              updateForm("category", event.target.value as FinancialCategory)
            }
            value={form.category}
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm md:col-span-2 xl:col-span-1">
          <span className="font-medium">Descricao</span>
          <input
            className="h-10 rounded-md border border-border-soft bg-surface-raised px-3 text-ink placeholder:text-ink-muted"
            onChange={(event) => updateForm("description", event.target.value)}
            placeholder="Ex: mercado da semana"
            value={form.description}
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Valor</span>
          <input
            className="h-10 rounded-md border border-border-soft bg-surface-raised px-3 text-ink placeholder:text-ink-muted"
            inputMode="decimal"
            onChange={(event) => updateForm("amount", event.target.value)}
            placeholder="0,00"
            type="number"
            value={form.amount}
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Data</span>
          <input
            className="h-10 rounded-md border border-border-soft bg-surface-raised px-3 text-ink"
            onChange={(event) => updateForm("date", event.target.value)}
            type="date"
            value={form.date}
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Status</span>
          <select
            className="h-10 rounded-md border border-border-soft bg-surface-raised px-3 text-ink disabled:cursor-not-allowed disabled:text-ink-muted"
            disabled={!requiresStatus}
            onChange={(event) =>
              updateForm("status", event.target.value as BillStatus)
            }
            value={form.status}
          >
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
          </select>
        </label>

        <label className="flex h-10 items-center gap-3 self-end rounded-md border border-border-soft bg-surface-raised px-3 text-sm">
          <input
            checked={form.recurring}
            className="h-4 w-4 accent-teal-strong"
            onChange={(event) => updateForm("recurring", event.target.checked)}
            type="checkbox"
          />
          <span className="font-medium">Recorrente</span>
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-ruby-soft bg-ruby-soft px-3 py-2 text-sm text-ruby-strong">
          {error}
        </p>
      )}

      <div className="mt-4 flex justify-end">
        {initialTransaction && onCancel && (
          <Button
            className="mr-2"
            onClick={onCancel}
            type="button"
            variant="secondary"
          >
            <X aria-hidden="true" className="h-4 w-4" />
            Cancelar
          </Button>
        )}
        <Button type="submit">
          <Save aria-hidden="true" className="h-4 w-4" />
          {submitLabel ?? "Salvar lancamento"}
        </Button>
      </div>
    </form>
  );
}
