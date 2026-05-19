import { navigationItems } from "../../lib/navigation";
import { cn } from "../../lib/utils";
import type { PageId } from "../../types/navigation";

type SidebarProps = {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
};

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="hidden h-screen w-64 shrink-0 border-r border-border-soft bg-surface px-3 py-4 lg:flex lg:flex-col">
      <div className="mb-6 px-3">
        <p className="text-sm font-semibold text-ink">Controle de Gastos</p>
        <p className="mt-1 text-xs text-ink-muted">Assistente financeiro local</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Navegacao principal">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activePage;

          return (
            <button
              key={item.label}
              className={cn(
                "flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition-colors",
                isActive
                  ? "bg-teal-soft text-teal-strong"
                  : "text-ink-muted hover:bg-surface-muted hover:text-ink",
              )}
              onClick={() => onNavigate(item.id)}
              type="button"
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
