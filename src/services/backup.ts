import { z } from "zod";
import { getCurrentMonthKey } from "../lib/date";
import type { Goal, Transaction } from "../types/finance";
import type { StrategyAggressiveness } from "../types/strategy";

const transactionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["income", "expense", "bill", "debt"]),
  category: z.enum([
    "moradia",
    "alimentacao",
    "transporte",
    "lazer",
    "saude",
    "educacao",
    "reserva",
    "renda",
    "dividas",
  ]),
  description: z.string().min(1),
  amount: z.number().nonnegative(),
  date: z.string().min(10),
  recurring: z.boolean(),
  status: z.enum(["paid", "pending"]).optional(),
});

const goalSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  targetAmount: z.number().nonnegative(),
  currentAmount: z.number().nonnegative(),
  priority: z.enum(["low", "medium", "high"]),
});

const backupSchema = z.object({
  app: z.literal("controle-de-gastos"),
  version: z.literal(1),
  exportedAt: z.string(),
  data: z.object({
    activeStrategyPackIds: z.array(z.string()),
    selectedMonth: z.string().default(getCurrentMonthKey()),
    strategyAggressiveness: z.enum(["low", "medium", "high"]),
    transactions: z.array(transactionSchema),
    goals: z.array(goalSchema),
  }),
});

export type BackupPayload = z.infer<typeof backupSchema>;

export type BackupData = {
  activeStrategyPackIds: string[];
  selectedMonth: string;
  strategyAggressiveness: StrategyAggressiveness;
  transactions: Transaction[];
  goals: Goal[];
};

export function createBackupPayload(data: BackupData): BackupPayload {
  return {
    app: "controle-de-gastos",
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export function parseBackupPayload(rawBackup: string): BackupData {
  const parsed = backupSchema.safeParse(JSON.parse(rawBackup));

  if (!parsed.success) {
    throw new Error("Arquivo de backup invalido.");
  }

  return parsed.data.data;
}

export function downloadBackup(payload: BackupPayload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `controle-de-gastos-backup-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
