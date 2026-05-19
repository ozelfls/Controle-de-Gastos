import type { FinancialSnapshot, Goal, Transaction } from "../types/finance";

export const transactions: Transaction[] = [
  {
    id: "tx-001",
    type: "income",
    category: "renda",
    description: "Salario",
    amount: 5600,
    date: "2026-05-05",
    recurring: true,
  },
  {
    id: "tx-002",
    type: "bill",
    category: "moradia",
    description: "Aluguel",
    amount: 1650,
    date: "2026-05-08",
    recurring: true,
    status: "paid",
  },
  {
    id: "tx-003",
    type: "expense",
    category: "alimentacao",
    description: "Mercado",
    amount: 720,
    date: "2026-05-10",
    recurring: false,
  },
  {
    id: "tx-004",
    type: "expense",
    category: "lazer",
    description: "Restaurantes e streaming",
    amount: 520,
    date: "2026-05-12",
    recurring: false,
  },
  {
    id: "tx-005",
    type: "bill",
    category: "saude",
    description: "Plano de saude",
    amount: 430,
    date: "2026-05-20",
    recurring: true,
    status: "pending",
  },
  {
    id: "tx-006",
    type: "debt",
    category: "dividas",
    description: "Parcela cartao",
    amount: 380,
    date: "2026-05-22",
    recurring: true,
    status: "pending",
  },
  {
    id: "tx-007",
    type: "expense",
    category: "transporte",
    description: "Combustivel",
    amount: 310,
    date: "2026-05-14",
    recurring: false,
  },
];

export const goals: Goal[] = [
  {
    id: "goal-001",
    name: "Reserva de emergencia",
    targetAmount: 16800,
    currentAmount: 7400,
    priority: "high",
  },
  {
    id: "goal-002",
    name: "Quitar dividas",
    targetAmount: 3200,
    currentAmount: 1150,
    priority: "high",
  },
];

export const snapshots: FinancialSnapshot[] = [
  { month: "Jan", income: 5100, expenses: 4660, reserve: 5300 },
  { month: "Fev", income: 5200, expenses: 4520, reserve: 5900 },
  { month: "Mar", income: 5400, expenses: 4890, reserve: 6200 },
  { month: "Abr", income: 5600, expenses: 5140, reserve: 6800 },
  { month: "Mai", income: 5600, expenses: 4010, reserve: 7400 },
];
