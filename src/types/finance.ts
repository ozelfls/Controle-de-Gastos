export type TransactionType = "income" | "expense" | "bill" | "debt";

export type BillStatus = "paid" | "pending";

export type FinancialCategory =
  | "moradia"
  | "alimentacao"
  | "transporte"
  | "lazer"
  | "saude"
  | "educacao"
  | "reserva"
  | "renda"
  | "dividas";

export type Transaction = {
  id: string;
  type: TransactionType;
  category: FinancialCategory;
  description: string;
  amount: number;
  date: string;
  recurring: boolean;
  status?: BillStatus;
};

export type NewTransactionInput = {
  type: TransactionType;
  category: FinancialCategory;
  description: string;
  amount: number;
  date: string;
  recurring: boolean;
  status?: BillStatus;
};

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  priority: "low" | "medium" | "high";
};

export type FinancialSnapshot = {
  month: string;
  income: number;
  expenses: number;
  reserve: number;
};

export type FinancialIndicators = {
  monthlyIncome: number;
  totalExpenses: number;
  paidBills: number;
  pendingBills: number;
  expectedSurplus: number;
  safeDailySpend: number;
  financialHealthScore: number;
  reserveInMonths: number;
  leisureBudgetUsed: number;
  spendingVelocity: number;
};

export type RecommendationSeverity = "info" | "warning" | "critical" | "success";

export type Recommendation = {
  id: string;
  title: string;
  message: string;
  severity: RecommendationSeverity;
  priority: number;
};
