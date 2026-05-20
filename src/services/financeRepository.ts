import { invoke, isTauri } from "@tauri-apps/api/core";
import { goals, transactions } from "../data/mockFinance";
import { getCurrentMonthKey } from "../lib/date";
import type { Goal, Transaction } from "../types/finance";
import type { StrategyAggressiveness } from "../types/strategy";

const STORAGE_KEY = "controle-de-gastos.finance.v1";

export type PersistedFinanceState = {
  activeStrategyPackIds: string[];
  selectedMonth: string;
  strategyAggressiveness: StrategyAggressiveness;
  transactions: Transaction[];
  goals: Goal[];
};

export type FinanceRepositoryDriver = "local-storage" | "tauri-sqlite";

export type FinanceRepository = {
  readonly driver: FinanceRepositoryDriver;
  clear: () => void;
  load: () => PersistedFinanceState;
  loadPersisted: () => Promise<PersistedFinanceState>;
  reset: () => PersistedFinanceState;
  save: (state: PersistedFinanceState) => void;
};

const defaultStrategyState: Pick<
  PersistedFinanceState,
  "activeStrategyPackIds" | "selectedMonth" | "strategyAggressiveness"
> = {
  activeStrategyPackIds: ["conservador"],
  selectedMonth: getCurrentMonthKey(),
  strategyAggressiveness: "low",
};

export class LocalStorageFinanceRepository implements FinanceRepository {
  readonly driver = "local-storage" as const;

  constructor(private readonly storage: Storage | null = getBrowserStorage()) {}

  load() {
    if (!this.storage) {
      return createSeedFinanceState();
    }

    const rawState = this.storage.getItem(STORAGE_KEY);

    if (!rawState) {
      return createSeedFinanceState();
    }

    try {
      return normalizePersistedState(
        JSON.parse(rawState) as Partial<PersistedFinanceState>,
      );
    } catch {
      return createSeedFinanceState();
    }
  }

  async loadPersisted() {
    return this.load();
  }

  save(state: PersistedFinanceState) {
    if (!this.storage) {
      return;
    }

    this.storage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  clear() {
    if (!this.storage) {
      return;
    }

    this.storage.removeItem(STORAGE_KEY);
  }

  reset() {
    this.clear();
    return createSeedFinanceState();
  }
}

export class TauriSqliteFinanceRepository implements FinanceRepository {
  readonly driver = "tauri-sqlite" as const;

  constructor(
    private readonly fallbackRepository = new LocalStorageFinanceRepository(),
  ) {}

  load() {
    return this.fallbackRepository.load();
  }

  async loadPersisted() {
    try {
      const persistedState = await invoke<PersistedFinanceState | null>(
        "finance_load_state",
      );

      if (persistedState) {
        return normalizePersistedState(persistedState);
      }

      const seedState = this.fallbackRepository.load();
      await invoke("finance_save_state", { state: seedState });
      return seedState;
    } catch {
      return this.fallbackRepository.load();
    }
  }

  save(state: PersistedFinanceState) {
    void invoke("finance_save_state", { state }).catch(() => {
      this.fallbackRepository.save(state);
    });
  }

  clear() {
    void invoke("finance_clear_state").catch(() => {
      this.fallbackRepository.clear();
    });
  }

  reset() {
    const seedState = createSeedFinanceState();
    this.save(seedState);
    return seedState;
  }
}

export const financeRepository: FinanceRepository =
  isTauriRuntime()
    ? new TauriSqliteFinanceRepository()
    : new LocalStorageFinanceRepository();

export function loadPersistedFinanceState() {
  return financeRepository.load();
}

export function persistFinanceState(state: PersistedFinanceState) {
  financeRepository.save(state);
}

export function clearPersistedFinanceState() {
  financeRepository.clear();
}

export function loadSeedFinanceState() {
  return createSeedFinanceState();
}

function createSeedFinanceState(): PersistedFinanceState {
  return {
    activeStrategyPackIds: [...defaultStrategyState.activeStrategyPackIds],
    selectedMonth: defaultStrategyState.selectedMonth,
    strategyAggressiveness: defaultStrategyState.strategyAggressiveness,
    transactions: transactions.map((transaction) => ({ ...transaction })),
    goals: goals.map((goal) => ({ ...goal })),
  };
}

function normalizePersistedState(
  parsedState: Partial<PersistedFinanceState>,
): PersistedFinanceState {
  return {
    activeStrategyPackIds: Array.isArray(parsedState.activeStrategyPackIds)
      ? [...parsedState.activeStrategyPackIds]
      : [...defaultStrategyState.activeStrategyPackIds],
    selectedMonth:
      typeof parsedState.selectedMonth === "string"
        ? parsedState.selectedMonth
        : defaultStrategyState.selectedMonth,
    strategyAggressiveness: isStrategyAggressiveness(
      parsedState.strategyAggressiveness,
    )
      ? parsedState.strategyAggressiveness
      : defaultStrategyState.strategyAggressiveness,
    transactions: Array.isArray(parsedState.transactions)
      ? parsedState.transactions.map((transaction) => ({ ...transaction }))
      : transactions.map((transaction) => ({ ...transaction })),
    goals: Array.isArray(parsedState.goals)
      ? parsedState.goals.map((goal) => ({ ...goal }))
      : goals.map((goal) => ({ ...goal })),
  };
}

function isStrategyAggressiveness(
  value: unknown,
): value is StrategyAggressiveness {
  return value === "low" || value === "medium" || value === "high";
}

function getBrowserStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function isTauriRuntime() {
  try {
    return isTauri();
  } catch {
    return false;
  }
}
