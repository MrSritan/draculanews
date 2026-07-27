export function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "unknown";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function formatRange(from: Date, to: Date): string {
  const o: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${from.toLocaleDateString(undefined, o)} – ${to.toLocaleDateString(undefined, { ...o, year: "numeric" })}`;
}
