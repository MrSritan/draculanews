import { Link, useRouterState, type LinkProps } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { FiltersProvider, useFilters } from "@/lib/filters-context";
import {
  DATE_RANGES,
  GEOGRAPHIES,
  SECTORS,
  type IntelEvent,
} from "@/lib/data-client/types";
import { useEvents } from "@/lib/data-client/events-client";
import { DataSourceBadge } from "@/components/DataState";
import { useBookmarkCount } from "@/lib/bookmarks-store";


const NAV: Array<{ to: LinkProps["to"]; label: string }> = [
  { to: "/", label: "News Feed" },
  { to: "/companies", label: "Companies & Contacts" },
  { to: "/bookmarks", label: "Bookmarks" },
  { to: "/digest/weekly", label: "Weekly Digest" },
  { to: "/digest/monthly", label: "Monthly Digest" },
  { to: "/internships", label: "Internships" },

];

const COMING_SOON: string[] = [];

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <FiltersProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
        </div>
      </div>
    </FiltersProvider>
  );
}

function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const bookmarkCount = useBookmarkCount();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-panel">
      <div className="border-b border-border px-5 py-5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          Intelligence
        </div>
        <div className="mt-1 font-serif text-xl font-semibold leading-tight text-foreground">
          Aerospace &amp; Defence
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3 py-4">
        {NAV.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to as string}
              to={item.to}
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent text-sidebar-active-text"
                  : "text-sidebar-text hover:bg-white/5 hover:text-sidebar-hover-text"
              }`}
            >
              {item.label}
              {item.to === "/bookmarks" && bookmarkCount > 0 ? (
                <span className="ml-auto rounded-full border border-primary/40 bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  {bookmarkCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-5 py-4">
        <SidebarSectionTitle>Filters</SidebarSectionTitle>
        <FiltersPanel />
      </div>

      <div className="mt-auto border-t border-border px-5 py-4">
        <SidebarSectionTitle>Coming Soon</SidebarSectionTitle>
        <ul className="mt-3 space-y-2">
          {COMING_SOON.map((item) => (
            <li
              key={item}
              className="flex items-center justify-between rounded-md px-2 py-1.5 text-xs text-muted-foreground/70"
              aria-disabled="true"
            >
              <span className="truncate">{item}</span>
              <span className="ml-2 shrink-0 rounded border border-border-light bg-surface-2 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Soon
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function SidebarSectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </div>
  );
}

function FiltersPanel() {
  const f = useFilters();
  return (
    <div className="mt-3 flex flex-col gap-3">
      <FieldLabel label="Date">
        <select
          value={f.dateRange}
          onChange={(e) => f.setDateRange(e.target.value as typeof f.dateRange)}
          className="filter-select"
        >
          {DATE_RANGES.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
      </FieldLabel>

      <FieldLabel label="Minimum score">
        <select
          value={f.minScore}
          onChange={(e) => f.setMinScore(Number(e.target.value))}
          className="filter-select"
        >
          {[0, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <option key={n} value={n}>
              {n === 0 ? "Any" : `${n}+`}
            </option>
          ))}
        </select>
      </FieldLabel>

      <FieldLabel label="Sector">
        <select
          value={f.sector}
          onChange={(e) => f.setSector(e.target.value as typeof f.sector)}
          className="filter-select"
        >
          {SECTORS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </FieldLabel>

      <FieldLabel label="Geography">
        <select
          value={f.geography}
          onChange={(e) => f.setGeography(e.target.value as typeof f.geography)}
          className="filter-select"
        >
          {GEOGRAPHIES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </FieldLabel>

      <style>{`
        .filter-select {
          width: 100%;
          background-color: var(--color-surface-2);
          border: 1px solid var(--color-border);
          color: var(--color-foreground);
          border-radius: 6px;
          padding: 6px 8px;
          font-size: 12px;
          font-family: inherit;
        }
        .filter-select:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 1px var(--color-primary);
        }
        .filter-select option { background-color: var(--color-surface-2); color: var(--color-foreground); }
      `}</style>
    </div>
  );
}

function FieldLabel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function TopBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = NAV.find((n) => n.to === pathname)?.label ?? "Dashboard";
  const { result } = useEvents();
  const events = result?.data ?? [];
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface-2 px-6">
      <div className="flex items-baseline gap-3">
        <h1 className="font-serif text-lg font-semibold text-foreground">{title}</h1>
        <span className="text-xs text-muted-foreground">Local sample data</span>
        <DataSourceBadge source={result?.source} />
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Demo mode
        </span>
        <span className="text-muted-foreground/50">|</span>
        <span>Settings</span>
        <span className="text-muted-foreground/50">|</span>
        <button
          type="button"
          onClick={() => exportEventsToCsv(events)}
          className="rounded-md border border-primary/40 bg-primary/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-primary/25"
        >
          Export
        </button>
      </div>
    </header>
  );
}

function exportEventsToCsv(events: IntelEvent[]) {

  const headers = [
    "id",
    "publishedAt",
    "score",
    "type",
    "status",
    "company",
    "geography",
    "sector",
    "publisher",
    "sourceQuality",
    "headline",
    "summary",
    "sourceUrl",
  ];
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = events.map((e) =>
    [
      e.id,
      e.publishedAt,
      e.score,
      e.type,
      e.status,
      e.company,
      e.geography,
      e.sector.join("|"),
      e.publisher,
      e.sourceQuality,
      e.headline,
      e.summary,
      e.sourceUrl ?? "",
    ]
      .map(escape)
      .join(","),
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `intel-events-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
