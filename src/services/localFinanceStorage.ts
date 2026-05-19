import { goals, transactions } from "../data/mockFinance";
import { getCurrentMonthKey } from "../lib/date";
import type { Goal, Transaction } from "../types/finance";
import type { StrategyAggressiveness } from "../types/strategy";

const STORAGE_KEY = "controle-de-gastos.finance.v1";

type PersistedFinanceState = {
  activeStrategyPackIds: string[];
  selectedMonth: string;
  strategyAggressiveness: StrategyAggressiveness;
  transactions: Transaction[];
  goals: Goal[];
};

const defaultStrategyState: Pick<
  PersistedFinanceState,
  "activeStrategyPackIds" | "selectedMonth" | "strategyAggressiveness"
> = {
  activeStrategyPackIds: ["conservador"],
  selectedMonth: getCurrentMonthKey(),
  strategyAggressiveness: "low",
};

export function loadPersistedFinanceState(): PersistedFinanceState {
  if (typeof window === "undefined") {
    return { ...defaultStrategyState, transactions, goals };
  }

  const rawState = window.localStorage.getItem(STORAGE_KEY);

  if (!rawState) {
    return { ...defaultStrategyState, transactions, goals };
  }

  try {
    const parsedState = JSON.parse(rawState) as Partial<PersistedFinanceState>;

    return {
      activeStrategyPackIds: Array.isArray(parsedState.activeStrategyPackIds)
        ? parsedState.activeStrategyPackIds
        : defaultStrategyState.activeStrategyPackIds,
      selectedMonth:
        typeof parsedState.selectedMonth === "string"
          ? parsedState.selectedMonth
          : defaultStrategyState.selectedMonth,
      strategyAggressiveness:
        parsedState.strategyAggressiveness === "low" ||
        parsedState.strategyAggressiveness === "medium" ||
        parsedState.strategyAggressiveness === "high"
          ? parsedState.strategyAggressiveness
          : defaultStrategyState.strategyAggressiveness,
      transactions: Array.isArray(parsedState.transactions)
        ? parsedState.transactions
        : transactions,
      goals: Array.isArray(parsedState.goals) ? parsedState.goals : goals,
    };
  } catch {
    return { ...defaultStrategyState, transactions, goals };
  }
}

export function persistFinanceState(state: PersistedFinanceState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearPersistedFinanceState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function loadSeedFinanceState(): PersistedFinanceState {
  return { ...defaultStrategyState, transactions, goals };
}
