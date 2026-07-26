import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ScoreBadge, StatusBadge, Tag } from "@/components/badges";
import { useFilters } from "@/lib/filters-context";
import { companies, events, type IntelCompany } from "@/lib/intel-data";

export const Route = createFileRoute("/companies")({
  head: () => ({
    meta: [
      { title: "Companies & Contacts | Aerospace & Defence Intelligence" },
      {
        name: "description",
        content:
          "Searchable roster of aerospace and defence companies with public contacts, sector, location, hiring status, and event timeline.",
      },
      {
        property: "og:title",
        content: "Companies & Contacts | Aerospace & Defence Intelligence",
      },
      {
        property: "og:description",
        content:
          "Companies and public contacts view for aerospace and defence intelligence dashboard.",
      },
    ],
  }),
  component: CompaniesPage,
});

function CompaniesPage() {
  return (
    <DashboardLayout>
      <CompaniesContent />
    </DashboardLayout>
  );
}

function CompaniesContent() {
  const filters = useFilters();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return companies
      .filter((c) => c.score >= filters.minScore)
      .filter((c) =>
        filters.sector === "All" ? true : c.sector.includes(filters.sector),
      )
      .filter((c) =>
        filters.geography === "India + Global"
          ? true
          : c.geography === filters.geography,
      )
      .filter((c) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.sector.some((s) => s.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => b.score - a.score);
  }, [filters, query]);

  const [selectedId, setSelectedId] = useState<string | null>(filtered[0]?.id ?? null);
  const selected =
    filtered.find((c) => c.id === selectedId) ?? filtered[0] ?? null;

  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-[minmax(0,1fr)_480px] gap-4 p-4">
      <section className="scrollbar-slim flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-panel">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <div className="font-serif text-base font-semibold">Companies</div>
            <div className="text-xs text-muted-foreground">
              {filtered.length} tracked
            </div>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, sector, location"
            className="h-8 w-64 rounded-md border border-border bg-surface-2 px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="scrollbar-slim min-w-0 flex-1 overflow-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="sticky top-0 bg-panel">
              <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                <Th>Score</Th>
                <Th>Company</Th>
                <Th>Sector</Th>
                <Th>Location</Th>
                <Th>Latest signal</Th>
                <Th>Hiring</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const active = selected?.id === c.id;
                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`cursor-pointer border-b border-border-light transition-colors ${
                      active ? "bg-accent/40" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <Td>
                      <ScoreBadge score={c.score} />
                    </Td>
                    <Td>
                      <div className="font-serif text-sm font-semibold text-foreground">
                        {c.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {c.geography}
                      </div>
                    </Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {c.sector.map((s) => (
                          <Tag key={s}>{s}</Tag>
                        ))}
                      </div>
                    </Td>
                    <Td>{c.location}</Td>
                    <Td>
                      <div className="max-w-[240px] truncate text-foreground/90">
                        {c.latestSignal}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(c.latestActivityAt).toLocaleDateString()}
                      </div>
                    </Td>
                    <Td>
                      {c.hiring ? (
                        <span className="text-success">Yes</span>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </Td>
                    <Td>
                      <StatusBadge status={c.status} />
                    </Td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No companies match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="scrollbar-slim overflow-y-auto rounded-lg border border-border bg-panel">
        {selected ? <CompanyDetail company={selected} /> : (
          <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
            Select a company to see details, timeline, and public contacts.
          </div>
        )}
      </aside>
    </div>
  );
}

function CompanyDetail({ company }: { company: IntelCompany }) {
  const timeline = events
    .filter((e) => e.companyId === company.id)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-semibold">{company.name}</h2>
          <ScoreBadge score={company.score} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{company.location}</span>
          <span>·</span>
          <span>{company.geography}</span>
          <StatusBadge status={company.status} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {company.sector.map((s) => (
            <Tag key={s}>{s}</Tag>
          ))}
        </div>
      </div>

      <div className="scrollbar-slim flex-1 space-y-5 overflow-y-auto px-5 py-4">
        <section>
          <SectionHeading>About</SectionHeading>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {company.description}
          </p>
        </section>

        <section>
          <SectionHeading>Official links</SectionHeading>
          <ul className="mt-2 flex flex-col gap-1.5 text-xs">
            <LinkRow label="Website" href={company.website} />
            <LinkRow label="Careers" href={company.careers} />
            <LinkRow label="Company LinkedIn" href={company.linkedin} />
            <LinkRow label="Official news" href={company.officialNews} />
            <LinkRow label="GitHub" href={company.github} />
          </ul>
        </section>

        <section>
          <SectionHeading>Event timeline</SectionHeading>
          {timeline.length === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              No recorded events for this company yet.
            </p>
          ) : (
            <ol className="mt-2 space-y-2">
              {timeline.map((e) => (
                <li
                  key={e.id}
                  className="rounded-md border border-border-light bg-surface-2 px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{new Date(e.publishedAt).toLocaleDateString()}</span>
                    <span>·</span>
                    <span className="uppercase tracking-wider">{e.type.replace("_", " ")}</span>
                  </div>
                  <div className="mt-1 text-sm text-foreground/90">{e.headline}</div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section>
          <SectionHeading>Public contacts</SectionHeading>
          {company.contacts.length === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              No public contacts recorded. Contact collection is intentionally out of scope for the MVP.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {company.contacts.map((c) => (
                <li
                  key={c.id}
                  className="rounded-md border border-border-light bg-surface-2 p-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-serif text-sm font-semibold text-foreground">
                        {c.name}
                      </div>
                      <div className="text-muted-foreground">{c.designation}</div>
                    </div>
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        c.emailConfidence === "verified_public"
                          ? "border-success/30 bg-success/12 text-success"
                          : "border-warning/30 bg-warning/12 text-warning"
                      }`}
                    >
                      {c.emailConfidence === "verified_public"
                        ? "Verified public"
                        : "Probable"}
                    </span>
                  </div>
                  <div className="mt-1.5 text-muted-foreground">{c.relevance}</div>
                  {c.publicEmail && (
                    <div className="mt-1.5">
                      <a
                        href={`mailto:${c.publicEmail}`}
                        className="text-primary hover:underline"
                      >
                        {c.publicEmail}
                      </a>
                    </div>
                  )}
                  {c.sourceUrl && (
                    <div className="mt-1 truncate text-[11px] text-muted-foreground">
                      Source:{" "}
                      <a
                        href={c.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {c.sourceUrl}
                      </a>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function LinkRow({ label, href }: { label: string; href?: string }) {
  if (!href)
    return (
      <li className="flex items-center justify-between text-muted-foreground/60">
        <span>{label}</span>
        <span className="text-[11px]">not listed</span>
      </li>
    );
  return (
    <li className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="max-w-[260px] truncate text-primary hover:underline"
      >
        {href}
      </a>
    </li>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </h3>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-3 py-2 font-semibold">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2 align-middle">{children}</td>;
}
