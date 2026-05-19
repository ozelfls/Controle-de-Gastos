import { describe, expect, it } from "vitest";
import { goals, transactions } from "../data/mockFinance";
import { calculateIndicators } from "./indicators";

describe("calculateIndicators", () => {
  it("calcula os principais indicadores do mes", () => {
    const indicators = calculateIndicators(transactions, goals);

    expect(indicators.monthlyIncome).toBe(5600);
    expect(indicators.totalExpenses).toBe(4010);
    expect(indicators.paidBills).toBe(1);
    expect(indicators.pendingBills).toBe(2);
    expect(indicators.expectedSurplus).toBe(1590);
    expect(indicators.safeDailySpend).toBe(53);
    expect(indicators.reserveInMonths).toBeCloseTo(1.845, 3);
    expect(indicators.leisureBudgetUsed).toBeCloseTo(0.7428, 3);
    expect(indicators.financialHealthScore).toBeGreaterThan(70);
  });

  it("nao retorna gasto diario negativo quando ha deficit", () => {
    const indicators = calculateIndicators(
      [
        {
          id: "income",
          type: "income",
          category: "renda",
          description: "Renda",
          amount: 1000,
          date: "2026-05-01",
          recurring: true,
        },
        {
          id: "expense",
          type: "expense",
          category: "moradia",
          description: "Aluguel",
          amount: 1400,
          date: "2026-05-02",
          recurring: true,
        },
      ],
      [],
    );

    expect(indicators.expectedSurplus).toBe(-400);
    expect(indicators.safeDailySpend).toBe(0);
  });
});
