import { describe, expect, it } from "vitest";
import { goals, transactions } from "../data/mockFinance";
import { createBackupPayload, parseBackupPayload } from "./backup";

describe("backup contract", () => {
  it("cria e le um backup valido", () => {
    const payload = createBackupPayload({
      activeStrategyPackIds: ["conservador", "reserva"],
      selectedMonth: "2026-05",
      strategyAggressiveness: "low",
      transactions,
      goals,
    });

    const parsed = parseBackupPayload(JSON.stringify(payload));

    expect(parsed.activeStrategyPackIds).toEqual(["conservador", "reserva"]);
    expect(parsed.selectedMonth).toBe("2026-05");
    expect(parsed.strategyAggressiveness).toBe("low");
    expect(parsed.transactions).toHaveLength(transactions.length);
    expect(parsed.goals).toHaveLength(goals.length);
  });

  it("rejeita arquivo que nao pertence ao app", () => {
    expect(() =>
      parseBackupPayload(
        JSON.stringify({
          app: "outro-app",
          version: 1,
          exportedAt: new Date().toISOString(),
          data: {},
        }),
      ),
    ).toThrow("Arquivo de backup invalido.");
  });
});
