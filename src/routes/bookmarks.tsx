import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { EventTypeBadge, ScoreBadge, StatusBadge, Tag } from "@/components/badges";
import {
  clearBookmarks,
  removeBookmark,
  setBookmarkNote,
  useBookmarks,
  type BookmarkRecord,
} from "@/lib/bookmarks-store";
import { DataState } from "@/components/DataState";
import { useEvents } from "@/lib/data-client/events-client";
import type { IntelEvent } from "@/lib/data-client/types";
import { isSafeExternalUrl } from "@/lib/url-validation";

export const Route = createFileRoute("/bookmarks")({
  head: () => ({
    meta: [
      { title: "Bookmarks | Aerospace & Defence Intelligence" },
      {
        name: "description",
        content:
          "Saved aerospace and defence signals with private notes, sortable and exportable for personal review.",
      },
      { property: "og:title", content: "Bookmarks | Aerospace & Defence Intelligence" },
      {
        property: "og:description",
        content:
          "Saved aerospace and defence signals with private notes, sortable and exportable for personal review.",
      },
    ],
  }),
  component: BookmarksPage,
});

type SortMode = "saved" | "score" | "published";

type Row = {
  bookmark: BookmarkRecord;
  event: IntelEvent | null;
};

function BookmarksPage() {
  return (
    <DashboardLayout>
      <BookmarksContent />
    </DashboardLayout>
  );
}

function BookmarksContent() {
  const bookmarks = useBookmarks();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("saved");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { loading, result } = useEvents();
  const events = useMemo(() => result?.data ?? [], [result]);
  const eventMap = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);

  const rows: Row[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const joined: Row[] = bookmarks.map((b) => ({
      bookmark: b,
      event: eventMap.get(b.id) ?? null,
    }));
    const filtered = q
      ? joined.filter(({ bookmark, event }) => {
          const hay = [
            event?.headline,
            event?.company,
            event?.summary,
            bookmark.note,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        })
      : joined;
    const sorted = [...filtered].sort((a, b) => {
      if (sort === "score") {
        return (b.event?.score ?? -1) - (a.event?.score ?? -1);
      }
      if (sort === "published") {
        const ta = a.event ? new Date(a.event.publishedAt).getTime() : 0;
        const tb = b.event ? new Date(b.event.publishedAt).getTime() : 0;
        return tb - ta;
      }
      return (
        new Date(b.bookmark.savedAt).getTime() -
        new Date(a.bookmark.savedAt).getTime()
      );
    });
    return sorted;
  }, [bookmarks, eventMap, query, sort]);

  const selected =
    rows.find((r) => r.bookmark.id === selectedId) ?? rows[0] ?? null;

  const handleClearAll = () => {
    if (!bookmarks.length) return;
    if (window.confirm("Remove all bookmarks? This cannot be undone.")) {
      clearBookmarks();
      setSelectedId(null);
    }
  };

  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-[minmax(0,1fr)_460px] gap-4 p-4">
      <section className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-panel">
        <header className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
          <div className="flex items-baseline gap-2">
            <h2 className="font-serif text-base font-semibold text-foreground">
              Bookmarks
            </h2>
            <span className="text-xs text-muted-foreground">
              {bookmarks.length} saved
            </span>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search headline, company, note…"
              className="w-56 rounded-md border border-border bg-surface-2 px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              className="rounded-md border border-border bg-surface-2 px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="saved">Recently saved</option>
              <option value="score">Score</option>
              <option value="published">Published date</option>
            </select>
            <button
              type="button"
              onClick={() => exportBookmarksCsv(rows)}
              disabled={!rows.length}
              className="rounded-md border border-primary/40 bg-primary/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-primary/25 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              disabled={!bookmarks.length}
              className="rounded-md border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-foreground/90 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear all
            </button>
          </div>
        </header>

        <DataState
          loading={loading}
          error={result?.error}
          source={result?.source}
          emptyTitle="No bookmarks yet"
          emptyHint="Open an event in the News Feed and choose Bookmark to save it here."
          onRetry={() => window.location.reload()}
        >
          {rows.length === 0 ? (
            <EmptyList hasQuery={query.trim().length > 0} />
          ) : (
            <ul className="scrollbar-slim flex-1 divide-y divide-border overflow-y-auto">
              {rows.map((row) => (
                <li key={row.bookmark.id}>
                  <BookmarkRow
                    row={row}
                    active={selected?.bookmark.id === row.bookmark.id}
                    onSelect={() => setSelectedId(row.bookmark.id)}
                    onRemove={() => {
                      removeBookmark(row.bookmark.id);
                      if (selectedId === row.bookmark.id) setSelectedId(null);
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </DataState>
      </section>

      <aside className="scrollbar-slim overflow-y-auto rounded-lg border border-border bg-panel">
        {selected ? (
          <BookmarkDetail
            row={selected}
            onRemove={() => {
              removeBookmark(selected.bookmark.id);
              setSelectedId(null);
            }}
          />
        ) : (
          <EmptyDetail />
        )}
      </aside>
    </div>
  );
}

function BookmarkRow({
  row,
  active,
  onSelect,
  onRemove,
}: {
  row: Row;
  active: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const { bookmark, event } = row;
  return (
    <div
      className={`group flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors ${
        active ? "bg-accent/40" : "hover:bg-white/[0.03]"
      }`}
      onClick={onSelect}
    >
      {event ? (
        <ScoreBadge score={event.score} />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface-2 font-mono text-xs text-muted-foreground">
          —
        </div>
      )}
      <div className="min-w-0 flex-1">
        {event ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <EventTypeBadge type={event.type} />
              <StatusBadge status={event.status} />
              <span className="text-xs text-muted-foreground">{event.company}</span>
            </div>
            <h3 className="mt-1.5 font-serif text-[15px] font-semibold leading-snug text-foreground">
              {event.headline}
            </h3>
          </>
        ) : (
          <h3 className="font-serif text-[15px] font-semibold leading-snug text-muted-foreground">
            Unavailable event {bookmark.id}
          </h3>
        )}
        <div className="mt-2 text-[11px] text-muted-foreground">
          saved {formatSaved(bookmark.savedAt)}
          {bookmark.note ? <> · <span className="italic">“{bookmark.note}”</span></> : null}
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="shrink-0 rounded-md border border-border bg-surface-2 px-2 py-1 text-[11px] font-medium text-foreground/80 opacity-0 transition hover:bg-white/5 group-hover:opacity-100"
      >
        Remove
      </button>
    </div>
  );
}

function BookmarkDetail({ row, onRemove }: { row: Row; onRemove: () => void }) {
  const { bookmark, event } = row;
  const [noteDraft, setNoteDraft] = useState(bookmark.note ?? "");

  if (!event) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-serif text-xl font-semibold leading-snug text-muted-foreground">
            Unavailable event {bookmark.id}
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            This bookmark refers to an event no longer in the local dataset.
          </p>
        </div>
        <div className="mt-auto border-t border-border px-5 py-3">
          <button
            type="button"
            onClick={onRemove}
            className="rounded-md border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-foreground/90 hover:bg-white/5"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

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
          <span>saved {formatSaved(bookmark.savedAt)}</span>
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
          <SectionHeading>Note</SectionHeading>
          <textarea
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            onBlur={() => setBookmarkNote(bookmark.id, noteDraft)}
            placeholder="Add a private note…"
            rows={4}
            className="mt-2 w-full resize-y rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
          />
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
          {isSafeExternalUrl(event.sourceUrl) ? (
            <a
              href={event.sourceUrl as string}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-2 block break-all text-xs text-primary hover:underline"
            >
              Open Source
            </a>
          ) : event.sourceUrl ? (
            <p className="mt-2 text-xs opacity-40" title="No valid source URL">
              Open Source
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">Source unavailable</p>
          )}
        </section>
      </div>

      <div className="border-t border-border px-5 py-3">
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-foreground/90 hover:bg-white/5"
        >
          Remove
        </button>
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

function EmptyList({ hasQuery }: { hasQuery: boolean }) {
  if (hasQuery) {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center gap-1 p-8 text-center text-sm text-muted-foreground">
        <p>No bookmarks match this search.</p>
        <p className="text-xs text-muted-foreground/70">
          Try a different keyword or clear the search.
        </p>
      </div>
    );
  }
  return (
    <div className="flex h-full min-h-64 flex-col items-center justify-center gap-1 p-8 text-center text-sm text-muted-foreground">
      <p className="text-foreground/90">No bookmarks yet</p>
      <p className="text-xs">
        Open an event in the News Feed and choose Bookmark to save it here.
      </p>
    </div>
  );
}

function EmptyDetail() {
  return (
    <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
      Select a bookmark to view details and edit its note.
    </div>
  );
}

function formatSaved(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "unknown";
  const diffMs = Date.now() - d.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  if (diffH < 1) return "just now";
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

function exportBookmarksCsv(rows: Row[]): void {
  const headers = [
    "id",
    "savedAt",
    "note",
    "score",
    "publishedAt",
    "type",
    "status",
    "company",
    "geography",
    "sector",
    "publisher",
    "headline",
    "summary",
    "sourceUrl",
  ];
  const body = rows.map(({ bookmark, event }) =>
    [
      bookmark.id,
      bookmark.savedAt,
      bookmark.note ?? "",
      event?.score ?? "",
      event?.publishedAt ?? "",
      event?.type ?? "",
      event?.status ?? "",
      event?.company ?? "",
      event?.geography ?? "",
      event?.sector.join("|") ?? "",
      event?.publisher ?? "",
      event?.headline ?? (event ? "" : `Unavailable event ${bookmark.id}`),
      event?.summary ?? "",
      event?.sourceUrl ?? "",
    ]
      .map(csvCell)
      .join(","),
  );
  const csv = [headers.map(csvCell).join(","), ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `bookmarks-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
