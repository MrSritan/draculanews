import type { ReactNode } from "react";
import type { DataError, DataSource } from "@/lib/data-client/types";

interface DataStateProps {
  loading?: boolean;
  refreshing?: boolean;
  error?: DataError;
  isEmpty?: boolean;
  source?: DataSource;
  emptyTitle?: string;
  emptyHint?: string;
  onRetry?: () => void;
  children?: ReactNode;
}

export function DataSourceBadge({ source }: { source?: DataSource }) {
  if (source !== "fixtures") return null;
  return (
    <span className="inline-flex items-center rounded border border-border-light bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      Sample data
    </span>
  );
}

export function DataState({
  loading,
  refreshing,
  error,
  isEmpty,
  emptyTitle,
  emptyHint,
  onRetry,
  children,
}: DataStateProps) {
  if (loading) return <SkeletonRows />;

  if (error) {
    const copy = errorCopy(error);
    return (
      <>
        {refreshing ? <RefreshingBar /> : null}
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 p-8 text-center text-sm text-muted-foreground">
          <p className="text-foreground/90">{copy.title}</p>
          <p className="text-xs">{copy.hint}</p>
          {copy.retry && onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-1 rounded-md border border-primary/40 bg-primary/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-primary/25"
            >
              Retry
            </button>
          ) : null}
        </div>
        {/* Stale data stays visible when the last collection run failed. */}
        {error.kind === "last-run-failed" ? children : null}
      </>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center gap-1 p-8 text-center text-sm text-muted-foreground">
        {emptyTitle ? <p className="text-foreground/90">{emptyTitle}</p> : null}
        {emptyHint ? <p className="text-xs">{emptyHint}</p> : null}
      </div>
    );
  }

  return (
    <>
      {refreshing ? <RefreshingBar /> : null}
      {children}
    </>
  );
}

function errorCopy(error: DataError): {
  title: string;
  hint: string;
  retry: boolean;
} {
  switch (error.kind) {
    case "db-unavailable":
      return {
        title: "Local database unavailable",
        hint: error.message || "The local data store could not be opened.",
        retry: true,
      };
    case "db-locked":
      return {
        title: "Database busy, retrying…",
        hint: error.message || "Another process is writing to the database.",
        retry: true,
      };
    case "no-run-yet":
      return {
        title: "No collection run yet",
        hint:
          error.message ||
          "Nothing has been collected so far. Data appears after the first run.",
        retry: false,
      };
    case "last-run-failed":
      return {
        title: "Last collection failed",
        hint: error.message || "Showing the most recent data available.",
        retry: true,
      };
    default:
      return {
        title: "Something went wrong",
        hint: error.message || "Unexpected error reading local data.",
        retry: error.retryable,
      };
  }
}

function RefreshingBar() {
  return (
    <div className="border-b border-border px-4 py-1.5 text-[11px] text-muted-foreground">
      Refreshing…
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-3 p-4" aria-busy="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-md border border-border-light bg-surface-2 px-3 py-3"
        >
          <div className="h-8 w-8 shrink-0 animate-pulse rounded-md bg-white/5" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded bg-white/5" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-white/5" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
