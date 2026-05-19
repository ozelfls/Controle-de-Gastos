import type {
  FinancialIndicators,
  Recommendation,
  RecommendationSeverity,
} from "../types/finance";
import type { StrategyAggressiveness, StrategyPack } from "../types/strategy";

export function generateRecommendations(
  indicators: FinancialIndicators,
  strategyContext?: {
    activePacks: StrategyPack[];
    aggressiveness: StrategyAggressiveness;
  },
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (indicators.reserveInMonths < 1) {
    recommendations.push(createRecommendation({
      id: "reserve-critical",
      title: "Reserva abaixo de 1 mes",
      message:
        "Sua reserva cobre menos de um mes de gastos. Priorize formar caixa antes de assumir novos compromissos.",
      severity: "critical",
      priority: 100,
    }));
  }

  if (indicators.pendingBills > 0) {
    recommendations.push(createRecommendation({
      id: "pending-bills",
      title: "Contas ainda pendentes",
      message:
        "Existem contas ou dividas pendentes neste mes. Resolva vencimentos proximos antes de ampliar gastos variaveis.",
      severity: "warning",
      priority: 80,
    }));
  }

  if (indicators.leisureBudgetUsed > 0.7) {
    recommendations.push(createRecommendation({
      id: "leisure-velocity",
      title: "Lazer acelerado",
      message:
        "O consumo de lazer ja passou de 70% do limite mensal. Reduzir agora evita aperto no fim do mes.",
      severity: "warning",
      priority: 70,
    }));
  }

  if (indicators.expectedSurplus > indicators.monthlyIncome * 0.15) {
    recommendations.push(createRecommendation({
      id: "healthy-surplus",
      title: "Sobra mensal saudavel",
      message:
        "A sobra prevista esta confortavel. Direcionar parte dela para reserva ou quitacao de dividas melhora sua margem de seguranca.",
      severity: "success",
      priority: 50,
    }));
  }

  if (recommendations.length === 0) {
    recommendations.push(createRecommendation({
      id: "stable-month",
      title: "Mes sob controle",
      message:
        "Os principais indicadores estao equilibrados. Mantenha o ritmo e acompanhe vencimentos pendentes.",
      severity: "info",
      priority: 10,
    }));
  }

  if (strategyContext) {
    recommendations.push(
      ...generateStrategyRecommendations(indicators, strategyContext),
    );
  }

  return recommendations.sort((a, b) => b.priority - a.priority);
}

function createRecommendation(input: {
  id: string;
  title: string;
  message: string;
  severity: RecommendationSeverity;
  priority: number;
}) {
  return input;
}

function generateStrategyRecommendations(
  indicators: FinancialIndicators,
  context: {
    activePacks: StrategyPack[];
    aggressiveness: StrategyAggressiveness;
  },
) {
  return context.activePacks
    .filter((pack) => isPackRelevant(pack, indicators))
    .map((pack) =>
      createRecommendation({
        id: `pack-${pack.id}`,
        title: `Pack ${pack.name}`,
        message: buildPackMessage(pack, context.aggressiveness),
        severity: getPackSeverity(pack.id),
        priority: pack.priority + getAggressivenessPriorityBoost(context.aggressiveness),
      }),
    );
}

function isPackRelevant(pack: StrategyPack, indicators: FinancialIndicators) {
  const conditions = pack.conditions;

  if (
    typeof conditions.reserveInMonthsMin === "number" &&
    indicators.reserveInMonths < conditions.reserveInMonthsMin
  ) {
    return false;
  }

  if (
    typeof conditions.reserveInMonthsMax === "number" &&
    indicators.reserveInMonths > conditions.reserveInMonthsMax
  ) {
    return false;
  }

  if (conditions.hasDebt === true && indicators.pendingBills === 0) {
    return false;
  }

  if (conditions.negativeSurplus === true && indicators.expectedSurplus >= 0) {
    return false;
  }

  if (
    conditions.healthySurplusRequired === true &&
    indicators.expectedSurplus <= indicators.monthlyIncome * 0.15
  ) {
    return false;
  }

  if (conditions.debtAllowed === false && indicators.pendingBills > 0) {
    return false;
  }

  return true;
}

function buildPackMessage(
  pack: StrategyPack,
  aggressiveness: StrategyAggressiveness,
) {
  const baseMessage = pack.messages[0] ?? "Pack ativo para orientar a estrategia.";

  if (aggressiveness === "high") {
    return `${baseMessage} Agressividade alta aumenta prioridade de metas, mas exige reserva e revisao frequente.`;
  }

  if (aggressiveness === "medium") {
    return `${baseMessage} Agressividade media busca equilibrio entre seguranca e progresso.`;
  }

  return `${baseMessage} Agressividade baixa prioriza margem de seguranca.`;
}

function getPackSeverity(packId: string): RecommendationSeverity {
  if (packId === "sobrevivencia-financeira") {
    return "critical";
  }

  if (packId === "anti-divida" || packId === "reserva") {
    return "warning";
  }

  if (packId === "conservador") {
    return "info";
  }

  return "success";
}

function getAggressivenessPriorityBoost(
  aggressiveness: StrategyAggressiveness,
) {
  if (aggressiveness === "high") {
    return 10;
  }

  if (aggressiveness === "medium") {
    return 5;
  }

  return 0;
}
