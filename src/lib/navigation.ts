import {
  BarChart3,
  CalendarClock,
  ClipboardList,
  Flag,
  Home,
  PiggyBank,
  ReceiptText,
  Settings,
} from "lucide-react";
import type { NavigationItem } from "../types/navigation";

export const navigationItems: NavigationItem[] = [
  { id: "dashboard", label: "Inicio", icon: Home },
  { id: "transactions", label: "Lancamentos", icon: ReceiptText },
  { id: "bills", label: "Contas", icon: CalendarClock },
  { id: "planning", label: "Planejamento", icon: ClipboardList },
  { id: "strategies", label: "Estrategias", icon: PiggyBank },
  { id: "goals", label: "Metas", icon: Flag },
  { id: "reports", label: "Relatorios", icon: BarChart3 },
  { id: "settings", label: "Configuracoes", icon: Settings },
];

export function getPageTitle(pageId: string) {
  return navigationItems.find((item) => item.id === pageId)?.label ?? "Inicio";
}
