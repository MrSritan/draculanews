import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BookmarkButton } from "@/components/BookmarkButton";
import { DataState } from "@/components/DataState";
import {
  EventTypeBadge,
  ScoreBadge,
  SourceQualityDot,
  StatusBadge,
  Tag,
} from "@/components/badges";
import { dateRangeDays, useFilters } from "@/lib/filters-context";
import { useEvents } from "@/lib/data-client/events-client";
import type { IntelEvent } from "@/lib/data-client/types";
import { sourceQualityLabel } from "@/lib/format";
import { isSafeExternalUrl, openExternal } from "@/lib/url-validation";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "News Feed | Aerospace & Defence Intelligence" },
      {
        name: "description",
        content:
          "Ranked feed of funding, hiring, contract, partnership, flight-test, and award signals across aerospace and defence companies in India and globally.",
      },
      { property: "og:title", content: "News Feed | Aerospace & Defence Intelligence" },
      {
        property: "og:description",
        content:
          "Ranked feed of funding, hiring, contract, partnership, flight-test, and award signals across aerospace and defence companies in India and globally.",
      },
    ],
  }),
  component: NewsFeedPage,
});

function NewsFeedPage() {
  return (
    <DashboardLayout>
      <NewsFeedContent />
    </DashboardLayout>
  );
}

function NewsFeedContent() {
  const filters = useFilters();
  const [sortBy, setSortBy] = useState<"score" | "newest" | "oldest">("score");
  const { loading, result } = useEvents();
  const events = useMemo(() => result?.data ?? [], [result]);
  const filtered = useMemo(
    () => filterEvents(events, filters, sortBy),
    [events, filters, sortBy],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected =
    filtered.find((e) => e.id === selectedId) ?? filtered[0] ?? null;

  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-[minmax(0,1fr)_460px] gap-4 p-4">
      <section className="scrollbar-slim min-w-0 overflow-y-auto rounded-lg border border-border bg-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-panel/95 px-4 py-3 backdrop-blur">
          <div>
            <div className="font-serif text-base font-semibold">Ranked signals</div>
            <div className="text-xs text-muted-foreground">
              {filtered.length} event{filtered.length === 1 ? "" : "s"} matching filters
            </div>
          </div>
          <label className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            Sort by
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-md border border-border bg-surface-2 px-2 py-1 text-xs font-medium normal-case tracking-normal text-foreground focus:border-primary focus:outline-none"
            >
              <option value="score">Score, then date</option>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
        </div>

        <DataState
          loading={loading}
          error={result?.error}
          source={result?.source}
          isEmpty={!loading && !result?.error && filtered.length === 0}
          emptyTitle="No signals match the current filters."
          emptyHint="Try widening date range, lowering minimum score, or clearing the sector filter."
          onRetry={() => window.location.reload()}
        >
          <ul className="divide-y divide-border">
            {filtered.map((e) => (
              <li key={e.id}>
                <EventRow
                  event={e}
                  active={selected?.id === e.id}
                  onSelect={() => setSelectedId(e.id)}
                />
              </li>
            ))}
          </ul>
        </DataState>
      </section>



      <aside className="scrollbar-slim overflow-y-auto rounded-lg border border-border bg-panel">
        {selected ? <EventDetail event={selected} /> : <EmptyDetail />}
      </aside>
    </div>
  );
}

function EventRow({
  event,
  active,
  onSelect,
}: {
  event: IntelEvent;
  active: boolean;
  onSelect: () => void;
}) {
  const openSource = (e: React.MouseEvent) => {
    if (!event.sourceUrl) return;
    e.stopPropagation();
    openExternal(event.sourceUrl);
  };


  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full cursor-pointer px-4 py-3 text-left transition-colors ${
        active ? "bg-accent/40" : "hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex gap-3">
        <ScoreBadge score={event.score} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <EventTypeBadge type={event.type} />
            <StatusBadge status={event.status} />
            <span className="text-xs text-muted-foreground">{event.company}</span>
            <span className="text-xs text-muted-foreground/50">·</span>
            <span className="text-xs text-muted-foreground">{event.geography}</span>
          </div>
          <h3
            className="mt-1.5 font-serif text-[15px] font-semibold leading-snug text-foreground hover:text-primary"
            onClick={openSource}
          >
            {event.headline}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <SourceQualityDot quality={event.sourceQuality} />
            <span>{event.publisher}</span>
            <span className="text-muted-foreground/40">·</span>
            <span>{formatDate(event.publishedAt)}</span>
            {event.sector.slice(0, 2).map((s) => (
              <Tag key={s}>{s}</Tag>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

function EventDetail({ event }: { event: IntelEvent }) {
  const hasSource = Boolean(event.sourceUrl);
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <EventTypeBadge type={event.type} />
          <StatusBadge status={event.status} />
        </div>
        <h2 className="mt-3 font-serif text-xl font-semibold leading-snug">
          {event.headline}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="text-foreground">{event.company}</span>
          <span>{event.geography}</span>
          <span>{formatDate(event.publishedAt)}</span>
          <span className="inline-flex items-center gap-1.5">
            <SourceQualityDot quality={event.sourceQuality} />
            {sourceQualityLabel(event.sourceQuality)} · {event.publisher}
          </span>
        </div>
      </div>

      <div className="scrollbar-slim flex-1 space-y-5 overflow-y-auto px-5 py-4">
        <section>
          <SectionHeading>Summary</SectionHeading>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {event.summary}
          </p>
        </section>

        <section>
          <SectionHeading>Score {event.score} / 10</SectionHeading>
          <ul className="mt-2 space-y-1.5">
            {event.scoreBreakdown.map((r, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-md border border-border-light bg-surface-2 px-3 py-1.5 text-xs"
              >
                <span className="text-foreground/90">{r.label}</span>
                <span className="font-mono text-primary">
                  {r.points >= 0 ? "+" : ""}
                  {r.points}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <SectionHeading>Sector tags</SectionHeading>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {event.sector.map((s) => (
              <Tag key={s}>{s}</Tag>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading>Source</SectionHeading>
          {hasSource ? (
            <a
              href={event.sourceUrl ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block break-all text-xs text-primary hover:underline"
            >
              {event.sourceUrl}
            </a>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">Source unavailable</p>
          )}
        </section>
      </div>

      <div className="border-t border-border px-5 py-3">
        <div className="flex flex-wrap gap-2">
          <ActionButton
            variant="primary"
            disabled={!hasSource}
            onClick={() =>
              hasSource &&
              window.open(event.sourceUrl!, "_blank", "noopener,noreferrer")
            }
          >
            Open Source
          </ActionButton>
          <ActionButton>Open Company</ActionButton>
          <BookmarkButton eventId={event.id} />
          <ActionButton>Mark Reviewed</ActionButton>
          <ActionButton>Ignore</ActionButton>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </h3>
  );
}

function ActionButton({
  children,
  variant = "default",
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  variant?: "default" | "primary";
  disabled?: boolean;
  onClick?: () => void;
}) {
  const base =
    "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40";
  const styles =
    variant === "primary"
      ? "border-primary/40 bg-primary/15 text-primary hover:bg-primary/25"
      : "border-border bg-surface-2 text-foreground/90 hover:bg-white/5";
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

function EmptyDetail() {
  return (
    <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
      Select a signal from the list to see details, score explanation, and source.
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-64 items-center justify-center p-8 text-center text-sm text-muted-foreground">
      No signals match the current filters. Try widening date range, lowering minimum
      score, or clearing the sector filter.
    </div>
  );
}

function filterEvents(
  list: IntelEvent[],
  f: ReturnType<typeof useFilters>,
  sortBy: "score" | "newest" | "oldest",
): IntelEvent[] {
  const days = dateRangeDays(f.dateRange);
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return list
    .filter((e) => e.score >= f.minScore)
    .filter((e) => new Date(e.publishedAt).getTime() >= cutoff)
    .filter((e) => (f.sector === "All" ? true : e.sector.includes(f.sector)))
    .filter((e) =>
      f.geography === "India + Global" ? true : e.geography === f.geography,
    )
    .sort((a, b) => {
      const ta = new Date(a.publishedAt).getTime();
      const tb = new Date(b.publishedAt).getTime();
      if (sortBy === "newest") return tb - ta;
      if (sortBy === "oldest") return ta - tb;
      if (b.score !== a.score) return b.score - a.score;
      if (tb !== ta) return tb - ta;
      const rank: Record<string, number> = {
        official: 0,
        reputable: 1,
        third_party: 2,
        unknown: 3,
      };
      return rank[a.sourceQuality] - rank[b.sourceQuality];
    });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  if (diffH < 1) return "just now";
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
