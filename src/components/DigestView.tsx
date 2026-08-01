import { useMemo, useState } from "react";
import { BookmarkButton } from "@/components/BookmarkButton";
import { EventTypeBadge, ScoreBadge } from "@/components/badges";
import { DataState } from "@/components/DataState";
import { useEvents } from "@/lib/data-client/events-client";
import type { IntelEvent } from "@/lib/data-client/types";
import { daysAgo, formatDate, formatRange } from "@/lib/date-utils";
import { openExternal } from "@/lib/url-validation";

interface DigestViewProps {
  title: string;
  days: number;
  minScore: number;
}

export function DigestView({ title, days, minScore }: DigestViewProps) {
  const [threshold, setThreshold] = useState(minScore);
  const { loading, result } = useEvents();
  const events = useMemo(() => result?.data ?? [], [result]);

  const items = useMemo(() => {
    const cutoff = daysAgo(days).getTime();
    return events
      .filter((e) => e.score >= threshold && new Date(e.publishedAt).getTime() >= cutoff)
      .sort(
        (a, b) =>
          b.score - a.score ||
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
  }, [events, days, threshold]);

  const range = formatRange(daysAgo(days), new Date());


  const summary = useMemo(() => {
    const companies = new Set(items.map((i) => i.company));
    const byType = new Map<string, number>();
    let highest = 0;
    for (const it of items) {
      byType.set(it.type, (byType.get(it.type) ?? 0) + 1);
      if (it.score > highest) highest = it.score;
    }
    return {
      total: items.length,
      highest,
      companyCount: companies.size,
      byType: Array.from(byType.entries()),
    };
  }, [items]);

  const grouped = useMemo(() => {
    const map = new Map<string, IntelEvent[]>();
    for (const e of items) {
      const key = new Date(e.publishedAt).toISOString().slice(0, 10);
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [items]);

  const copyMarkdown = async () => {
    const lines = [
      `## ${title} — ${range}`,
      `_${items.length} events scoring ${threshold} or above_`,
      "",
      ...items.map((e) => {
        const d = new Date(e.publishedAt).toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
        });
        return `- **[${e.score}]** ${e.headline} — *${e.company}* (${e.publisher}, ${d})`;
      }),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="scrollbar-slim h-[calc(100vh-3.5rem)] overflow-y-auto p-4">
      <div className="mx-auto max-w-4xl space-y-4">
        <header className="rounded-lg border border-border bg-panel px-5 py-4">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-foreground">{title}</h2>
              <div className="mt-1 text-xs text-muted-foreground">
                {range} · {items.length} events scoring {threshold} or above
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                Min score
                <select
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="rounded-md border border-border bg-surface-2 px-2 py-1 text-xs font-medium normal-case tracking-normal text-foreground focus:border-primary focus:outline-none"
                >
                  {[7, 8, 9].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={copyMarkdown}
                className="rounded-md border border-primary/40 bg-primary/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-primary/25"
              >
                Copy digest as Markdown
              </button>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground/70">
            Digest ignores the sidebar filters.
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryStat label="Total items" value={String(summary.total)} />
          <SummaryStat
            label="Highest score"
            value={summary.total ? `${summary.highest} / 10` : "—"}
          />
          <SummaryStat label="Companies" value={String(summary.companyCount)} />
          <div className="rounded-lg border border-border bg-panel px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              By type
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {summary.byType.length === 0 ? (
                <span className="text-xs text-muted-foreground">—</span>
              ) : (
                summary.byType.map(([type, count]) => (
                  <span
                    key={type}
                    className="rounded border border-border-light bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-foreground/90"
                  >
                    {type} · {count}
                  </span>
                ))
              )}
            </div>
          </div>
        </section>

        {items.length === 0 ? (
          <EmptyDigest days={days} threshold={threshold} onLower={() => setThreshold((t) => Math.max(0, t - 1))} />
        ) : (
          <div className="space-y-4">
            {grouped.map(([day, list]) => (
              <div key={day} className="overflow-hidden rounded-lg border border-border bg-panel">
                <div className="sticky top-0 z-10 border-b border-border bg-panel/95 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
                  {formatDate(day)}
                </div>
                <ul className="divide-y divide-border">
                  {list.map((e) => (
                    <li key={e.id}>
                      <DigestRow event={e} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-panel px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-serif text-xl font-semibold text-foreground">{value}</div>
    </div>
  );
}

function DigestRow({ event }: { event: IntelEvent }) {
  const openSource = () => {
    if (event.sourceUrl) window.open(event.sourceUrl, "_blank", "noopener,noreferrer");
  };
  return (
    <div className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03]">
      <ScoreBadge score={event.score} />
      <button
        type="button"
        onClick={openSource}
        className="min-w-0 flex-1 cursor-pointer text-left"
      >
        <div className="flex flex-wrap items-center gap-2">
          <EventTypeBadge type={event.type} />
          <span className="text-xs text-muted-foreground">{event.company}</span>
        </div>
        <h3 className="mt-1.5 font-serif text-[15px] font-semibold leading-snug text-foreground hover:text-primary">
          {event.headline}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span>{event.publisher}</span>
          <span className="text-muted-foreground/40">·</span>
          <span>{formatDate(event.publishedAt)}</span>
        </div>
      </button>
      <div className="shrink-0">
        <BookmarkButton eventId={event.id} />
      </div>
    </div>
  );
}

function EmptyDigest({
  days,
  threshold,
  onLower,
}: {
  days: number;
  threshold: number;
  onLower: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-panel p-10 text-center text-sm text-muted-foreground">
      <p>
        No events scored {threshold} or above in the last {days} days.
      </p>
      <button
        type="button"
        onClick={onLower}
        disabled={threshold <= 0}
        className="rounded-md border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-foreground/90 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Lower threshold to {Math.max(0, threshold - 1)}
      </button>
    </div>
  );
}
