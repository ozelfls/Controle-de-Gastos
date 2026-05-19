import type { LucideIcon } from "lucide-react";

export type PageId =
  | "dashboard"
  | "transactions"
  | "bills"
  | "planning"
  | "strategies"
  | "goals"
  | "reports"
  | "settings";

export type NavigationItem = {
  id: PageId;
  label: string;
  icon: LucideIcon;
};
