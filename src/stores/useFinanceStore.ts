import { create } from "zustand";
import { strategyPacks } from "../data/strategyPacks";
import { snapshots } from "../data/mockFinance";
import { getCurrentMonthKey, isDateInMonth } from "../lib/date";
import { calculateIndicators } from "../rules/indicators";
import { generateRecommendations } from "../rules/recommendations";
import { financeRepository } from "../services/financeRepository";
import type {
  BillStatus,
  FinancialIndicators,
  FinancialSnapshot,
  Goal,
  NewTransactionInput,
  Recommendation,
  Transaction,
} from "../types/finance";
import type { StrategyAggressiveness } from "../types/strategy";

type FinanceStore = {
  transactions: Transaction[];
  activeStrategyPackIds: string[];
  goals: Goal[];
  monthTransactions: Transaction[];
  selectedMonth: string;
  snapshots: FinancialSnapshot[];
  strategyAggressiveness: StrategyAggressiveness;
  indicators: FinancialIndicators;
  recommendations: Recommendation[];
  addTransaction: (input: NewTransactionInput) => void;
  addGoalContribution: (goalId: string, amount: number) => void;
  importFinanceData: (data: {
    activeStrategyPackIds: string[];
    selectedMonth: string;
    strategyAggressiveness: StrategyAggressiveness;
    transactions: Transaction[];
    goals: Goal[];
  }) => void;
  removeTransaction: (transactionId: string) => void;
  resetToSeedData: () => void;
  setSelectedMonth: (monthKey: string) => void;
  setStrategyAggressiveness: (aggressiveness: StrategyAggressiveness) => void;
  toggleStrategyPack: (packId: string) => void;
  updateTransaction: (transactionId: string, input: NewTransactionInput) => void;
  updateTransactionStatus: (transactionId: string, status: BillStatus) => void;
};

function createDerivedState(
  currentTransactions: Transaction[],
  currentGoals: Goal[],
  activeStrategyPackIds: string[] = [],
  strategyAggressiveness: StrategyAggressiveness = "low",
  selectedMonth: string = getCurrentMonthKey(),
) {
  const monthTransactions = currentTransactions.filter((transaction) =>
    isDateInMonth(transaction.date, selectedMonth),
  );
  const currentIndicators = calculateIndicators(monthTransactions, currentGoals);
  const activePacks = strategyPacks.filter((pack) =>
    activeStrategyPackIds.includes(pack.id),
  );

  return {
    indicators: currentIndicators,
    monthTransactions,
    recommendations: generateRecommendations(currentIndicators, {
      activePacks,
      aggressiveness: strategyAggressiveness,
    }),
  };
}

const initialState = financeRepository.load();
const initialDerivedState = createDerivedState(
  initialState.transactions,
  initialState.goals,
  initialState.activeStrategyPackIds,
  initialState.strategyAggressiveness,
  initialState.selectedMonth,
);

export const useFinanceStore = create<FinanceStore>((set) => ({
  transactions: initialState.transactions,
  activeStrategyPackIds: initialState.activeStrategyPackIds,
  goals: initialState.goals,
  selectedMonth: initialState.selectedMonth,
  snapshots,
  strategyAggressiveness: initialState.strategyAggressiveness,
  ...initialDerivedState,
  addTransaction: (input) =>
    set((state) => {
      const nextTransactions: Transaction[] = [
        {
          ...input,
          id: crypto.randomUUID(),
        },
        ...state.transactions,
      ];
      financeRepository.save({
        activeStrategyPackIds: state.activeStrategyPackIds,
        selectedMonth: state.selectedMonth,
        strategyAggressiveness: state.strategyAggressiveness,
        transactions: nextTransactions,
        goals: state.goals,
      });

      return {
        transactions: nextTransactions,
        ...createDerivedState(
          nextTransactions,
          state.goals,
          state.activeStrategyPackIds,
          state.strategyAggressiveness,
          state.selectedMonth,
        ),
      };
    }),
  addGoalContribution: (goalId, amount) =>
    set((state) => {
      const nextGoals = state.goals.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              currentAmount: Math.min(
                goal.targetAmount,
                goal.currentAmount + Math.max(amount, 0),
              ),
            }
          : goal,
      );

      financeRepository.save({
        activeStrategyPackIds: state.activeStrategyPackIds,
        selectedMonth: state.selectedMonth,
        strategyAggressiveness: state.strategyAggressiveness,
        transactions: state.transactions,
        goals: nextGoals,
      });

      return {
        goals: nextGoals,
        ...createDerivedState(
          state.transactions,
          nextGoals,
          state.activeStrategyPackIds,
          state.strategyAggressiveness,
          state.selectedMonth,
        ),
      };
    }),
  importFinanceData: (data) =>
    set(() => {
      financeRepository.save(data);

      return {
        activeStrategyPackIds: data.activeStrategyPackIds,
        selectedMonth: data.selectedMonth,
        strategyAggressiveness: data.strategyAggressiveness,
        transactions: data.transactions,
        goals: data.goals,
        ...createDerivedState(
          data.transactions,
          data.goals,
          data.activeStrategyPackIds,
          data.strategyAggressiveness,
          data.selectedMonth,
        ),
      };
    }),
  removeTransaction: (transactionId) =>
    set((state) => {
      const nextTransactions = state.transactions.filter(
        (transaction) => transaction.id !== transactionId,
      );

      financeRepository.save({
        activeStrategyPackIds: state.activeStrategyPackIds,
        selectedMonth: state.selectedMonth,
        strategyAggressiveness: state.strategyAggressiveness,
        transactions: nextTransactions,
        goals: state.goals,
      });

      return {
        transactions: nextTransactions,
        ...createDerivedState(
          nextTransactions,
          state.goals,
          state.activeStrategyPackIds,
          state.strategyAggressiveness,
          state.selectedMonth,
        ),
      };
    }),
  resetToSeedData: () =>
    set(() => {
      const nextState = financeRepository.reset();

      return {
        transactions: nextState.transactions,
        activeStrategyPackIds: nextState.activeStrategyPackIds,
        goals: nextState.goals,
        selectedMonth: nextState.selectedMonth,
        strategyAggressiveness: nextState.strategyAggressiveness,
        ...createDerivedState(
          nextState.transactions,
          nextState.goals,
          nextState.activeStrategyPackIds,
          nextState.strategyAggressiveness,
          nextState.selectedMonth,
        ),
      };
    }),
  setSelectedMonth: (selectedMonth) =>
    set((state) => {
      financeRepository.save({
        activeStrategyPackIds: state.activeStrategyPackIds,
        selectedMonth,
        strategyAggressiveness: state.strategyAggressiveness,
        transactions: state.transactions,
        goals: state.goals,
      });

      return {
        selectedMonth,
        ...createDerivedState(
          state.transactions,
          state.goals,
          state.activeStrategyPackIds,
          state.strategyAggressiveness,
          selectedMonth,
        ),
      };
    }),
  setStrategyAggressiveness: (aggressiveness) =>
    set((state) => {
      financeRepository.save({
        activeStrategyPackIds: state.activeStrategyPackIds,
        selectedMonth: state.selectedMonth,
        strategyAggressiveness: aggressiveness,
        transactions: state.transactions,
        goals: state.goals,
      });

      return {
        strategyAggressiveness: aggressiveness,
        ...createDerivedState(
          state.transactions,
          state.goals,
          state.activeStrategyPackIds,
          aggressiveness,
          state.selectedMonth,
        ),
      };
    }),
  toggleStrategyPack: (packId) =>
    set((state) => {
      const nextActiveStrategyPackIds = state.activeStrategyPackIds.includes(packId)
        ? state.activeStrategyPackIds.filter((id) => id !== packId)
        : [...state.activeStrategyPackIds, packId];

      financeRepository.save({
        activeStrategyPackIds: nextActiveStrategyPackIds,
        selectedMonth: state.selectedMonth,
        strategyAggressiveness: state.strategyAggressiveness,
        transactions: state.transactions,
        goals: state.goals,
      });

      return {
        activeStrategyPackIds: nextActiveStrategyPackIds,
        ...createDerivedState(
          state.transactions,
          state.goals,
          nextActiveStrategyPackIds,
          state.strategyAggressiveness,
          state.selectedMonth,
        ),
      };
    }),
  updateTransaction: (transactionId, input) =>
    set((state) => {
      const nextTransactions = state.transactions.map((transaction) =>
        transaction.id === transactionId ? { ...input, id: transaction.id } : transaction,
      );

      financeRepository.save({
        activeStrategyPackIds: state.activeStrategyPackIds,
        selectedMonth: state.selectedMonth,
        strategyAggressiveness: state.strategyAggressiveness,
        transactions: nextTransactions,
        goals: state.goals,
      });

      return {
        transactions: nextTransactions,
        ...createDerivedState(
          nextTransactions,
          state.goals,
          state.activeStrategyPackIds,
          state.strategyAggressiveness,
          state.selectedMonth,
        ),
      };
    }),
  updateTransactionStatus: (transactionId, status) =>
    set((state) => {
      const nextTransactions = state.transactions.map((transaction) =>
        transaction.id === transactionId ? { ...transaction, status } : transaction,
      );

      financeRepository.save({
        activeStrategyPackIds: state.activeStrategyPackIds,
        selectedMonth: state.selectedMonth,
        strategyAggressiveness: state.strategyAggressiveness,
        transactions: nextTransactions,
        goals: state.goals,
      });

      return {
        transactions: nextTransactions,
        ...createDerivedState(
          nextTransactions,
          state.goals,
          state.activeStrategyPackIds,
          state.strategyAggressiveness,
          state.selectedMonth,
        ),
      };
    }),
}));
