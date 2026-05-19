import type { FinancialIndicators, Goal, Transaction } from "../types/finance";

const DAYS_IN_MONTH = 30;
const LEISURE_MONTHLY_BUDGET = 700;

export function calculateIndicators(
  transactions: Transaction[],
  goals: Goal[],
): FinancialIndicators {
  const monthlyIncome = sumByType(transactions, "income");
  const totalExpenses = transactions
    .filter((transaction) => transaction.type !== "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const paidBills = transactions.filter(
    (transaction) => transaction.type === "bill" && transaction.status === "paid",
  ).length;

  const pendingBills = transactions.filter(
    (transaction) =>
      (transaction.type === "bill" || transaction.type === "debt") &&
      transaction.status === "pending",
  ).length;

  const reserveGoal = goals.find((goal) => goal.name.toLowerCase().includes("reserva"));
  const currentReserve = reserveGoal?.currentAmount ?? 0;
  const averageMonthlyCost = Math.max(totalExpenses, 1);
  const expectedSurplus = monthlyIncome - totalExpenses;
  const safeDailySpend = Math.max(expectedSurplus / DAYS_IN_MONTH, 0);
  const reserveInMonths = currentReserve / averageMonthlyCost;

  const leisureSpend = transactions
    .filter((transaction) => transaction.category === "lazer")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const spendingVelocity =
    monthlyIncome > 0 ? Math.min(totalExpenses / monthlyIncome, 1.5) : 0;

  return {
    monthlyIncome,
    totalExpenses,
    paidBills,
    pendingBills,
    expectedSurplus,
    safeDailySpend,
    financialHealthScore: calculateHealthScore({
      expectedSurplus,
      monthlyIncome,
      reserveInMonths,
      pendingBills,
      spendingVelocity,
    }),
    reserveInMonths,
    leisureBudgetUsed: leisureSpend / LEISURE_MONTHLY_BUDGET,
    spendingVelocity,
  };
}

function sumByType(transactions: Transaction[], type: Transaction["type"]) {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((total, transaction) => total + transaction.amount, 0);
}

function calculateHealthScore(input: {
  expectedSurplus: number;
  monthlyIncome: number;
  reserveInMonths: number;
  pendingBills: number;
  spendingVelocity: number;
}) {
  const surplusRatio =
    input.monthlyIncome > 0 ? input.expectedSurplus / input.monthlyIncome : 0;

  const base = 55;
  const surplusScore = surplusRatio > 0 ? Math.min(surplusRatio * 90, 20) : -20;
  const reserveScore = Math.min(input.reserveInMonths * 8, 20);
  const billsPenalty = input.pendingBills * 4;
  const velocityPenalty = input.spendingVelocity > 0.85 ? 10 : 0;

  return Math.round(
    Math.max(0, Math.min(100, base + surplusScore + reserveScore - billsPenalty - velocityPenalty)),
  );
}
