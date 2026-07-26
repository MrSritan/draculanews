import type { ReactNode } from "react";
import type { EventType, ReviewStatus, SourceQuality } from "@/lib/intel-data";

export function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 8
      ? "bg-primary/15 text-primary border-primary/30"
      : score >= 5
        ? "bg-warning/15 text-warning border-warning/30"
        : "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20";
  return (
    <div
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border font-mono text-sm font-semibold ${tone}`}
      aria-label={`Priority score ${score} out of 10`}
    >
      {score}
    </div>
  );
}

const eventToneMap: Record<EventType, string> = {
  funding: "bg-success/12 text-success border-success/30",
  hiring: "bg-azure/12 text-azure border-azure/30",
  contract: "bg-indigo/12 text-indigo border-indigo/30",
  partnership: "bg-cyan/12 text-cyan border-cyan/30",
  product_launch: "bg-purple/12 text-purple border-purple/30",
  flight_test: "bg-orange/12 text-orange border-orange/30",
  award: "bg-warning/12 text-warning border-warning/30",
  news: "bg-muted-foreground/12 text-muted-foreground border-muted-foreground/25",
};

const eventLabels: Record<EventType, string> = {
  funding: "Funding",
  hiring: "Hiring",
  contract: "Contract",
  partnership: "Partnership",
  product_launch: "Product Launch",
  flight_test: "Flight Test",
  award: "Award",
  news: "News",
};

export function EventTypeBadge({ type }: { type: EventType }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${eventToneMap[type]}`}
    >
      {eventLabels[type]}
    </span>
  );
}

const statusToneMap: Record<ReviewStatus, string> = {
  NEW: "bg-info/12 text-info border-info/30",
  REVIEWED: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/25",
  BOOKMARKED: "bg-primary/15 text-primary border-primary/30",
  IGNORED: "bg-error/12 text-error border-error/30",
};

export function StatusBadge({ status }: { status: ReviewStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusToneMap[status]}`}
    >
      {status}
    </span>
  );
}

export function SourceQualityDot({ quality }: { quality: SourceQuality }) {
  const map: Record<SourceQuality, { color: string; label: string }> = {
    official: { color: "bg-success", label: "Official source" },
    reputable: { color: "bg-azure", label: "Reputable source" },
    third_party: { color: "bg-warning", label: "Third-party source" },
    unknown: { color: "bg-muted-foreground", label: "Unverified source" },
  };
  const { color, label } = map[quality];
  return (
    <span
      title={label}
      aria-label={label}
      className={`inline-block h-2 w-2 rounded-full ${color}`}
    />
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded border border-border-light bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted-foreground">
      {children}
    </span>
  );
}
