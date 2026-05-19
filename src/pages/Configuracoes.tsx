import {
  Database,
  Download,
  LockKeyhole,
  Moon,
  RotateCcw,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "../components/ui/button";
import {
  createBackupPayload,
  downloadBackup,
  parseBackupPayload,
} from "../services/backup";
import { useFinanceStore } from "../stores/useFinanceStore";
import { useSecurityStore } from "../stores/useSecurityStore";
import type { AutoLockMinutes } from "../types/security";

const autoLockOptions: AutoLockMinutes[] = [1, 5, 15, 30];

export function Configuracoes() {
  const activeStrategyPackIds = useFinanceStore(
    (state) => state.activeStrategyPackIds,
  );
  const goals = useFinanceStore((state) => state.goals);
  const importFinanceData = useFinanceStore((state) => state.importFinanceData);
  const resetToSeedData = useFinanceStore((state) => state.resetToSeedData);
  const selectedMonth = useFinanceStore((state) => state.selectedMonth);
  const strategyAggressiveness = useFinanceStore(
    (state) => state.strategyAggressiveness,
  );
  const transactions = useFinanceStore((state) => state.transactions);
  const autoLockMinutes = useSecurityStore((state) => state.autoLockMinutes);
  const hasPin = useSecurityStore((state) => state.hasPin);
  const hideSensitiveValues = useSecurityStore((state) => state.hideSensitiveValues);
  const removePin = useSecurityStore((state) => state.removePin);
  const setAutoLockMinutes = useSecurityStore((state) => state.setAutoLockMinutes);
  const setHideSensitiveValues = useSecurityStore(
    (state) => state.setHideSensitiveValues,
  );
  const setPin = useSecurityStore((state) => state.setPin);
  const backupInputRef = useRef<HTMLInputElement | null>(null);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [pin, setPinValue] = useState("");
  const [pinMessage, setPinMessage] = useState<string | null>(null);

  function handleReset() {
    const shouldReset = window.confirm(
      "Restaurar os dados de exemplo? Seus lancamentos locais atuais serao removidos deste preview.",
    );

    if (shouldReset) {
      resetToSeedData();
    }
  }

  async function handleSetPin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pin.length < 4) {
      setPinMessage("Use um PIN com ao menos 4 numeros.");
      return;
    }

    await setPin(pin);
    setPinValue("");
    setPinMessage("PIN ativado.");
  }

  function handleRemovePin() {
    const shouldRemove = window.confirm("Remover o PIN deste dispositivo?");

    if (shouldRemove) {
      removePin();
      setPinMessage("PIN removido.");
    }
  }

  function handleExportBackup() {
    downloadBackup(
      createBackupPayload({
        activeStrategyPackIds,
        selectedMonth,
        strategyAggressiveness,
        transactions,
        goals,
      }),
    );
    setBackupMessage("Backup exportado.");
  }

  async function handleImportBackup(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const data = parseBackupPayload(await file.text());
      const shouldImport = window.confirm(
        "Importar este backup e substituir os dados financeiros locais atuais?",
      );

      if (shouldImport) {
        importFinanceData(data);
        setBackupMessage("Backup importado com sucesso.");
      }
    } catch (error) {
      setBackupMessage(
        error instanceof Error ? error.message : "Nao foi possivel importar o backup.",
      );
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-5">
      <section className="rounded-md border border-border-soft bg-surface p-5">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-teal-soft text-teal-strong">
            <Moon aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Aparencia</h2>
            <p className="text-sm text-ink-muted">
              Tema escuro ativo como padrao para uso desktop prolongado.
            </p>
          </div>
        </div>

        <div className="rounded-md border border-border-soft bg-surface-muted p-4">
          <p className="text-sm font-medium">Tema atual</p>
          <p className="mt-1 text-sm text-ink-muted">Escuro</p>
        </div>
      </section>

      <section className="rounded-md border border-border-soft bg-surface p-5">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-teal-soft text-teal-strong">
            <LockKeyhole aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Bloqueio por PIN</h2>
            <p className="text-sm text-ink-muted">
              Protecao local para reduzir exposicao casual dos dados neste
              dispositivo.
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <form
            className="rounded-md border border-border-soft bg-surface-muted p-4"
            onSubmit={handleSetPin}
          >
            <label className="grid gap-2 text-sm">
              <span className="font-medium">
                {hasPin ? "Alterar PIN" : "Criar PIN"}
              </span>
              <input
                className="h-10 rounded-md border border-border-soft bg-surface-raised px-3 text-ink"
                inputMode="numeric"
                maxLength={8}
                minLength={4}
                onChange={(event) =>
                  setPinValue(event.target.value.replace(/\D/g, ""))
                }
                placeholder="4 a 8 numeros"
                type="password"
                value={pin}
              />
            </label>

            {pinMessage && (
              <p className="mt-3 text-sm text-ink-muted">{pinMessage}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Button disabled={pin.length < 4} type="submit">
                {hasPin ? "Atualizar PIN" : "Ativar PIN"}
              </Button>
              {hasPin && (
                <Button onClick={handleRemovePin} type="button" variant="secondary">
                  Remover PIN
                </Button>
              )}
            </div>
          </form>

          <div className="rounded-md border border-border-soft bg-surface-muted p-4">
            <p className="text-sm font-medium">Bloqueio automatico</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {autoLockOptions.map((minutes) => (
                <button
                  className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                    autoLockMinutes === minutes
                      ? "border-teal-strong bg-teal-soft text-teal-strong"
                      : "border-border-soft bg-surface-raised text-ink-muted hover:text-ink"
                  }`}
                  key={minutes}
                  onClick={() => setAutoLockMinutes(minutes)}
                  type="button"
                >
                  {minutes} min
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-border-soft bg-surface p-5">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-teal-soft text-teal-strong">
            <Database aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Dados locais</h2>
            <p className="text-sm text-ink-muted">
              Neste preview, os dados ficam no armazenamento local do dispositivo.
              No desktop final, esta camada sera substituida por SQLite via Tauri.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="rounded-md border border-border-soft bg-surface-muted p-4">
            <p className="text-sm font-medium">Lancamentos armazenados</p>
            <p className="mt-1 text-2xl font-semibold">{transactions.length}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleExportBackup} type="button" variant="secondary">
              <Download aria-hidden="true" className="h-4 w-4" />
              Exportar backup
            </Button>
            <Button
              onClick={() => backupInputRef.current?.click()}
              type="button"
              variant="secondary"
            >
              <Upload aria-hidden="true" className="h-4 w-4" />
              Importar backup
            </Button>
            <Button onClick={handleReset} type="button" variant="secondary">
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              Restaurar exemplo
            </Button>
          </div>
        </div>

        <input
          accept="application/json"
          className="hidden"
          onChange={handleImportBackup}
          ref={backupInputRef}
          type="file"
        />

        {backupMessage && (
          <p className="mt-4 rounded-md border border-border-soft bg-surface-muted px-3 py-2 text-sm text-ink-muted">
            {backupMessage}
          </p>
        )}
      </section>

      <section className="rounded-md border border-border-soft bg-surface p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-teal-soft text-teal-strong">
            <ShieldCheck aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Privacidade</h2>
            <p className="mt-1 text-sm leading-6 text-ink-muted">
              O MVP continua sem envio de dados para servidor. A prioridade da
              proxima fase de seguranca e adicionar PIN, bloqueio automatico e
              protecao do banco local.
            </p>
            <label className="mt-4 flex items-center gap-3 text-sm">
              <input
                checked={hideSensitiveValues}
                className="h-4 w-4 accent-teal-strong"
                onChange={(event) => setHideSensitiveValues(event.target.checked)}
                type="checkbox"
              />
              <span>Ocultar valores sensiveis por padrao</span>
            </label>
          </div>
        </div>
      </section>
    </div>
  );
}
