import type { LucideIcon } from "lucide-react";

type PlaceholderPageProps = {
  description: string;
  icon: LucideIcon;
  title: string;
};

export function PlaceholderPage({
  description,
  icon: Icon,
  title,
}: PlaceholderPageProps) {
  return (
    <section className="mx-auto max-w-4xl rounded-md border border-border-soft bg-surface p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-teal-soft text-teal-strong">
        <Icon aria-hidden="true" className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">
        {description}
      </p>
    </section>
  );
}
