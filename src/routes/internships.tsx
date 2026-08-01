import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DataState } from "@/components/DataState";
import { useOpportunities } from "@/lib/data-client/opportunities-client";
import type {
  FundingLevel,
  InternshipProgram,
  ProgramStatus,
} from "@/lib/data-client/types";
import { isSafeExternalUrl } from "@/lib/url-validation";

export const Route = createFileRoute("/internships")({
  head: () => ({
    meta: [
      { title: "Foreign Internships | Aerospace & Defence Intelligence" },
      {
        name: "description",
        content:
          "Curated list of government and government-funded international research internship programmes for Indian students.",
      },
      { property: "og:title", content: "Foreign Internships | Aerospace & Defence Intelligence" },
      {
        property: "og:description",
        content:
          "Curated list of government and government-funded international research internship programmes for Indian students.",
      },
    ],
  }),
  component: InternshipsPage,
});

const ANY = "Any";

function InternshipsPage() {
  return (
    <DashboardLayout>
      <InternshipsContent />
    </DashboardLayout>
  );
}

function InternshipsContent() {
  const [country, setCountry] = useState<string>(ANY);
  const [discipline, setDiscipline] = useState<string>(ANY);
  const [funding, setFunding] = useState<FundingLevel | typeof ANY>(ANY);
  const [status, setStatus] = useState<ProgramStatus | typeof ANY>(ANY);
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { loading, result } = useOpportunities();
  const INTERNSHIPS = useMemo(() => result?.data ?? [], [result]);

  const countries = useMemo(
    () => [ANY, ...Array.from(new Set(INTERNSHIPS.map((p) => p.country))).sort()],
    [INTERNSHIPS],
  );
  const disciplines = useMemo(
    () => [
      ANY,
      ...Array.from(new Set(INTERNSHIPS.flatMap((p) => p.disciplines))).sort(),
    ],
    [INTERNSHIPS],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return INTERNSHIPS.filter((p) => {
      if (country !== ANY && p.country !== country) return false;
      if (discipline !== ANY && !p.disciplines.includes(discipline)) return false;
      if (funding !== ANY && p.fundingLevel !== funding) return false;
      if (status !== ANY && p.status !== status) return false;
      if (needle) {
        const hay = `${p.name} ${p.organisation} ${p.country}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [INTERNSHIPS, country, discipline, funding, status, q]);

  const selected =
    filtered.find((p) => p.id === selectedId) ?? filtered[0] ?? null;

  const clearFilters = () => {
    setCountry(ANY);
    setDiscipline(ANY);
    setFunding(ANY);
    setStatus(ANY);
    setQ("");
  };

  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-[minmax(0,1fr)_460px] gap-4 p-4">
      <section className="scrollbar-slim min-w-0 overflow-y-auto rounded-lg border border-border bg-panel">
        <div className="sticky top-0 z-10 space-y-3 border-b border-border bg-panel/95 px-4 py-3 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-serif text-base font-semibold">Foreign internships</div>
              <div className="text-xs text-muted-foreground">
                {filtered.length} programme{filtered.length === 1 ? "" : "s"} matching filters
              </div>
            </div>
          </div>
          <div className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-[11px] leading-relaxed text-warning">
            Deadlines and stipends change every cycle. Always confirm on the official site
            before applying.
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterSelect label="Country" value={country} onChange={setCountry} options={countries} />
            <FilterSelect
              label="Discipline"
              value={discipline}
              onChange={setDiscipline}
              options={disciplines}
            />
            <FilterSelect
              label="Funding"
              value={funding}
              onChange={(v) => setFunding(v as FundingLevel | typeof ANY)}
              options={[ANY, "fully-funded", "stipend", "partial"]}
            />
            <FilterSelect
              label="Status"
              value={status}
              onChange={(v) => setStatus(v as ProgramStatus | typeof ANY)}
              options={[ANY, "open", "rolling", "announced", "closed"]}
            />
            <label className="flex flex-1 min-w-[160px] items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              Search
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Name, org, country"
                className="w-full rounded-md border border-border bg-surface-2 px-2 py-1 text-xs font-medium normal-case tracking-normal text-foreground focus:border-primary focus:outline-none"
              />
            </label>
          </div>
        </div>

        <DataState
          loading={loading}
          error={result?.error}
          source={result?.source}
          emptyTitle="No programmes available"
          emptyHint="Nothing has been collected yet."
          onRetry={() => window.location.reload()}
        >
          {filtered.length === 0 ? (
            <EmptyState onClear={clearFilters} />
          ) : (
            <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <ProgramCard
                  key={p.id}
                  program={p}
                  active={selected?.id === p.id}
                  onSelect={() => setSelectedId(p.id)}
                />
              ))}
            </div>
          )}
        </DataState>
      </section>

      <aside className="scrollbar-slim overflow-y-auto rounded-lg border border-border bg-panel">
        {selected ? <ProgramDetail program={selected} /> : <EmptyDetail />}
      </aside>
    </div>
  );
}

function ProgramCard({
  program,
  active,
  onSelect,
}: {
  program: InternshipProgram;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex h-full flex-col rounded-lg border p-4 text-left transition-colors ${
        active
          ? "border-primary/50 bg-accent/40"
          : "border-border bg-surface-2 hover:border-border-light hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">{program.flag}</span>
            <h3 className="font-serif text-base font-semibold leading-tight text-foreground">
              {program.name}
            </h3>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {program.country} · {program.organisation}
          </div>
        </div>
        <StatusPill status={program.status} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-y-1 text-[11px]">
        <dt className="text-muted-foreground">Stipend</dt>
        <dd className="text-right text-foreground/90">{program.stipend}</dd>
        <dt className="text-muted-foreground">Duration</dt>
        <dd className="text-right text-foreground/90">{program.duration}</dd>
      </dl>

      {program.isGovernment ? (
        <div className="mt-3">
          <span className="inline-flex items-center rounded border border-primary/40 bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            Government
          </span>
        </div>
      ) : null}
    </button>
  );
}

function ProgramDetail({ program }: { program: InternshipProgram }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <StatusPill status={program.status} />
          {program.isGovernment ? (
            <span className="inline-flex items-center rounded border border-primary/40 bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              Government
            </span>
          ) : null}
        </div>
        <h2 className="mt-3 font-serif text-xl font-semibold leading-snug">
          <span className="mr-2">{program.flag}</span>
          {program.name}
        </h2>
        <div className="mt-1 text-xs text-muted-foreground">
          {program.country} · {program.organisation}
        </div>
      </div>

      <div className="scrollbar-slim flex-1 space-y-5 overflow-y-auto px-5 py-4">
        <section>
          <SectionHeading>Summary</SectionHeading>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">{program.summary}</p>
        </section>

        <section>
          <SectionHeading>Eligibility</SectionHeading>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/90">
            {program.eligibility.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </section>

        <section>
          <SectionHeading>What's covered</SectionHeading>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {program.covers.map((c) => (
              <li
                key={c}
                className="rounded border border-border-light bg-surface-2 px-2 py-0.5 text-[11px] text-foreground/90"
              >
                {c}
              </li>
            ))}
          </ul>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <InfoBlock label="Duration" value={program.duration} />
          <InfoBlock label="Stipend" value={program.stipend} />
          <InfoBlock label="Window" value={program.applicationWindow} />
          <InfoBlock label="Funding" value={program.fundingLevel} />
        </section>

        <section>
          <SectionHeading>Deadline note</SectionHeading>
          <p className="mt-2 text-xs leading-relaxed text-warning">{program.deadlineNote}</p>
        </section>

        <section>
          <SectionHeading>Disciplines</SectionHeading>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {program.disciplines.map((d) => (
              <span
                key={d}
                className="rounded border border-border-light bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted-foreground"
              >
                {d}
              </span>
            ))}
          </div>
        </section>
      </div>

      <div className="border-t border-border px-5 py-3">
        {isSafeExternalUrl(program.officialUrl) ? (
          <a
            href={program.officialUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center rounded-md border border-primary/40 bg-primary/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-primary/25"
          >
            Open official page ↗
          </a>
        ) : (
          <span
            className="inline-flex items-center rounded-md border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground opacity-40"
            title="No valid source URL"
          >
            Open official page ↗
          </span>
        )}
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border-light bg-surface-2 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-xs text-foreground/90">{value}</div>
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

function StatusPill({ status }: { status: ProgramStatus }) {
  const tone: Record<ProgramStatus, string> = {
    open: "bg-success/15 text-success border-success/30",
    rolling: "bg-azure/15 text-azure border-azure/30",
    announced: "bg-warning/15 text-warning border-warning/30",
    closed: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/25",
  };
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tone[status]}`}
    >
      {status}
    </span>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-surface-2 px-2 py-1 text-xs font-medium normal-case tracking-normal text-foreground focus:border-primary focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function EmptyDetail() {
  return (
    <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
      Select a programme to see eligibility, coverage, and the official link.
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex h-full min-h-64 flex-col items-center justify-center gap-3 p-8 text-center text-sm text-muted-foreground">
      <div>No programmes match the current filters.</div>
      <button
        type="button"
        onClick={onClear}
        className="rounded-md border border-primary/40 bg-primary/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-primary/25"
      >
        Clear filters
      </button>
    </div>
  );
}
