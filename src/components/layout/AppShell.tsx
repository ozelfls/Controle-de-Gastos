import { LockKeyhole, Menu, Plus } from "lucide-react";
import type { ReactNode } from "react";
import type { PageId } from "../../types/navigation";
import { Button } from "../ui/button";
import { Sidebar } from "./Sidebar";

type AppShellProps = {
  activePage: PageId;
  children: ReactNode;
  hasPin: boolean;
  onLock: () => void;
  onNavigate: (page: PageId) => void;
  onSelectedMonthChange: (monthKey: string) => void;
  selectedMonth: string;
  subtitle: string;
  title: string;
};

export function AppShell({
  activePage,
  children,
  hasPin,
  onLock,
  onNavigate,
  onSelectedMonthChange,
  selectedMonth,
  subtitle,
  title,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface-muted text-ink">
      <div className="flex min-h-screen">
        <Sidebar activePage={activePage} onNavigate={onNavigate} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-border-soft bg-surface/95 px-4 py-3 shadow-[0_1px_0_rgba(255,255,255,0.02)] backdrop-blur sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Button
                  aria-label="Abrir navegacao"
                  className="lg:hidden"
                  size="icon"
                  type="button"
                  variant="secondary"
                >
                  <Menu aria-hidden="true" className="h-4 w-4" />
                </Button>

                <div className="min-w-0">
                  <h1 className="truncate text-lg font-semibold sm:text-xl">
                    {title}
                  </h1>
                  <p className="truncate text-xs text-ink-muted sm:text-sm">
                    {subtitle}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <label className="hidden items-center gap-2 text-sm text-ink-muted md:flex">
                  <span>Mes</span>
                  <input
                    className="h-10 rounded-md border border-border-soft bg-surface-raised px-3 text-ink"
                    onChange={(event) => onSelectedMonthChange(event.target.value)}
                    type="month"
                    value={selectedMonth}
                  />
                </label>

                {hasPin && (
                  <Button
                    aria-label="Bloquear app"
                    onClick={onLock}
                    size="icon"
                    type="button"
                    variant="secondary"
                  >
                    <LockKeyhole aria-hidden="true" className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  onClick={() => onNavigate("transactions")}
                  type="button"
                >
                  <Plus aria-hidden="true" className="h-4 w-4" />
                  <span className="hidden sm:inline">Novo lancamento</span>
                </Button>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-4 py-5 sm:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
