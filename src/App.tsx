import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { LockScreen } from "./components/security/LockScreen";
import { formatMonthLabel } from "./lib/date";
import { getPageTitle } from "./lib/navigation";
import { useFinanceStore } from "./stores/useFinanceStore";
import { useSecurityStore } from "./stores/useSecurityStore";
import type { PageId } from "./types/navigation";

const Bills = lazy(() =>
  import("./pages/Bills").then((module) => ({ default: module.Bills })),
);
const Configuracoes = lazy(() =>
  import("./pages/Configuracoes").then((module) => ({
    default: module.Configuracoes,
  })),
);
const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((module) => ({ default: module.Dashboard })),
);
const Estrategias = lazy(() =>
  import("./pages/Estrategias").then((module) => ({
    default: module.Estrategias,
  })),
);
const Lancamentos = lazy(() =>
  import("./pages/Lancamentos").then((module) => ({
    default: module.Lancamentos,
  })),
);
const Metas = lazy(() =>
  import("./pages/Metas").then((module) => ({ default: module.Metas })),
);
const Planejamento = lazy(() =>
  import("./pages/Planejamento").then((module) => ({
    default: module.Planejamento,
  })),
);
const Relatorios = lazy(() =>
  import("./pages/Relatorios").then((module) => ({
    default: module.Relatorios,
  })),
);

export function App() {
  const [activePage, setActivePage] = useState<PageId>("dashboard");
  const autoLockMinutes = useSecurityStore((state) => state.autoLockMinutes);
  const hasPin = useSecurityStore((state) => state.hasPin);
  const isLocked = useSecurityStore((state) => state.isLocked);
  const lock = useSecurityStore((state) => state.lock);
  const unlockWithPin = useSecurityStore((state) => state.unlockWithPin);
  const hydrateFromRepository = useFinanceStore(
    (state) => state.hydrateFromRepository,
  );
  const selectedMonth = useFinanceStore((state) => state.selectedMonth);
  const setSelectedMonth = useFinanceStore((state) => state.setSelectedMonth);
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    void hydrateFromRepository();
  }, [hydrateFromRepository]);

  useEffect(() => {
    if (!hasPin || isLocked) {
      return;
    }

    const events = ["pointerdown", "keydown", "wheel", "touchstart"];
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    events.forEach((eventName) =>
      window.addEventListener(eventName, updateActivity, { passive: true }),
    );

    const interval = window.setInterval(() => {
      const inactiveMs = Date.now() - lastActivityRef.current;

      if (inactiveMs >= autoLockMinutes * 60 * 1000) {
        lock();
      }
    }, 10_000);

    return () => {
      events.forEach((eventName) =>
        window.removeEventListener(eventName, updateActivity),
      );
      window.clearInterval(interval);
    };
  }, [autoLockMinutes, hasPin, isLocked, lock]);

  if (isLocked) {
    return <LockScreen onUnlock={unlockWithPin} />;
  }

  return (
    <AppShell
      activePage={activePage}
      hasPin={hasPin}
      onLock={lock}
      onNavigate={setActivePage}
      onSelectedMonthChange={setSelectedMonth}
      selectedMonth={selectedMonth}
      subtitle={formatMonthLabel(selectedMonth)}
      title={getPageTitle(activePage)}
    >
      <Suspense fallback={<PageLoading />}>
        {activePage === "dashboard" && <Dashboard />}
        {activePage === "transactions" && <Lancamentos />}
        {activePage === "bills" && <Bills />}
        {activePage === "planning" && <Planejamento />}
        {activePage === "strategies" && <Estrategias />}
        {activePage === "goals" && <Metas />}
        {activePage === "reports" && <Relatorios />}
        {activePage === "settings" && <Configuracoes />}
      </Suspense>
    </AppShell>
  );
}

function PageLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl rounded-md border border-border-soft bg-surface p-5 text-sm text-ink-muted">
      Carregando...
    </div>
  );
}
