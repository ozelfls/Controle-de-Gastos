import { describe, expect, it } from "vitest";
import { goals, transactions } from "../data/mockFinance";
import {
  LocalStorageFinanceRepository,
  type PersistedFinanceState,
} from "./financeRepository";

describe("LocalStorageFinanceRepository", () => {
  it("carrega os dados seed quando nao ha storage disponivel", () => {
    const repository = new LocalStorageFinanceRepository(null);

    const state = repository.load();

    expect(state.activeStrategyPackIds).toEqual(["conservador"]);
    expect(state.strategyAggressiveness).toBe("low");
    expect(state.transactions).toHaveLength(transactions.length);
    expect(state.goals).toHaveLength(goals.length);
  });

  it("salva e carrega o estado financeiro persistido", () => {
    const storage = new MemoryStorage();
    const repository = new LocalStorageFinanceRepository(storage);
    const state: PersistedFinanceState = {
      activeStrategyPackIds: ["reserva"],
      selectedMonth: "2026-05",
      strategyAggressiveness: "medium",
      transactions: [transactions[0]],
      goals: [goals[0]],
    };

    repository.save(state);

    expect(repository.load()).toEqual(state);
  });

  it("volta para os dados seed quando o estado salvo esta corrompido", () => {
    const storage = new MemoryStorage();
    const repository = new LocalStorageFinanceRepository(storage);

    storage.setItem("controle-de-gastos.finance.v1", "{");

    expect(repository.load().transactions).toHaveLength(transactions.length);
  });

  it("limpa o estado salvo ao resetar", () => {
    const storage = new MemoryStorage();
    const repository = new LocalStorageFinanceRepository(storage);

    repository.save({
      activeStrategyPackIds: ["anti-divida"],
      selectedMonth: "2026-05",
      strategyAggressiveness: "high",
      transactions: [],
      goals: [],
    });

    const resetState = repository.reset();

    expect(storage.length).toBe(0);
    expect(resetState.activeStrategyPackIds).toEqual(["conservador"]);
    expect(resetState.transactions).toHaveLength(transactions.length);
  });
});

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}
