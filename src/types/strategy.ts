export type StrategyPack = {
  id: string;
  name: string;
  priority: number;
  conditions: Record<string, unknown>;
  messages: string[];
  allocations: {
    reserve?: number;
    debtPayment?: number;
    flexibleSpend?: number;
    investments?: number;
    essentialBills?: number;
  };
};

export type StrategyAggressiveness = "low" | "medium" | "high";
