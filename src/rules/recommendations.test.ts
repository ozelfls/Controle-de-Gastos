import { describe, expect, it } from "vitest";
import { strategyPacks } from "../data/strategyPacks";
import type { FinancialIndicators } from "../types/finance";
import { generateRecommendations } from "./recommendations";

const baseIndicators: FinancialIndicators = {
  monthlyIncome: 5000,
  totalExpenses: 3500,
  paidBills: 2,
  pendingBills: 0,
  expectedSurplus: 1500,
  safeDailySpend: 50,
  financialHealthScore: 82,
  reserveInMonths: 2,
  leisureBudgetUsed: 0.2,
  spendingVelocity: 0.7,
};

describe("generateRecommendations", () => {
  it("prioriza alerta critico quando a reserva cobre menos de um mes", () => {
    const recommendations = generateRecommendations({
      ...baseIndicators,
      reserveInMonths: 0.6,
      pendingBills: 2,
    });

    expect(recommendations[0]?.id).toBe("reserve-critical");
    expect(recommendations[0]?.priority).toBe(100);
  });

  it("sinaliza lazer acelerado quando passa de 70% do limite", () => {
    const recommendations = generateRecommendations({
      ...baseIndicators,
      leisureBudgetUsed: 0.71,
    });

    expect(recommendations.some((item) => item.id === "leisure-velocity")).toBe(
      true,
    );
  });

  it("gera mensagem positiva quando ha sobra saudavel", () => {
    const recommendations = generateRecommendations(baseIndicators);

    expect(recommendations.some((item) => item.id === "healthy-surplus")).toBe(
      true,
    );
  });

  it("inclui recomendacoes dos packs ativos quando as condicoes batem", () => {
    const recommendations = generateRecommendations(baseIndicators, {
      activePacks: strategyPacks.filter((pack) =>
        ["conservador", "reserva"].includes(pack.id),
      ),
      aggressiveness: "medium",
    });

    expect(recommendations.some((item) => item.id === "pack-conservador")).toBe(
      true,
    );
    expect(recommendations.some((item) => item.id === "pack-reserva")).toBe(true);
    expect(
      recommendations.find((item) => item.id === "pack-reserva")?.message,
    ).toContain("Agressividade media");
  });

  it("nao inclui pack quando as condicoes nao batem", () => {
    const recommendations = generateRecommendations(baseIndicators, {
      activePacks: strategyPacks.filter((pack) => pack.id === "anti-divida"),
      aggressiveness: "low",
    });

    expect(recommendations.some((item) => item.id === "pack-anti-divida")).toBe(
      false,
    );
  });
});
