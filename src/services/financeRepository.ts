import { goals, snapshots, transactions } from "../data/mockFinance";

export async function loadInitialFinanceData() {
  return {
    transactions,
    goals,
    snapshots,
  };
}
