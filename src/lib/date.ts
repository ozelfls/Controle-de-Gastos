export function getCurrentMonthKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

export function isDateInMonth(date: string, monthKey: string) {
  return date.startsWith(monthKey);
}

export function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);

  if (!year || !month) {
    return monthKey;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}
