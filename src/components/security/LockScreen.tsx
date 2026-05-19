import { LockKeyhole } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

type LockScreenProps = {
  onUnlock: (pin: string) => Promise<boolean>;
};

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const unlocked = await onUnlock(pin);
    setIsSubmitting(false);

    if (!unlocked) {
      setPin("");
      setError("PIN incorreto.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-muted p-4 text-ink">
      <form
        className="w-full max-w-sm rounded-md border border-border-soft bg-surface p-5"
        onSubmit={handleSubmit}
      >
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-teal-soft text-teal-strong">
          <LockKeyhole aria-hidden="true" className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold">App bloqueado</h1>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          Informe seu PIN para acessar os dados financeiros locais.
        </p>

        <label className="mt-5 grid gap-2 text-sm">
          <span className="font-medium">PIN</span>
          <input
            autoFocus
            className="h-11 rounded-md border border-border-soft bg-surface-raised px-3 text-center text-lg tracking-[0.35em] text-ink"
            inputMode="numeric"
            maxLength={8}
            minLength={4}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}
            type="password"
            value={pin}
          />
        </label>

        {error && (
          <p className="mt-4 rounded-md border border-ruby-soft bg-ruby-soft px-3 py-2 text-sm text-ruby-strong">
            {error}
          </p>
        )}

        <Button className="mt-5 w-full" disabled={isSubmitting || pin.length < 4}>
          Desbloquear
        </Button>
      </form>
    </main>
  );
}
