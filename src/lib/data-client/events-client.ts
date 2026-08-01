import { useEffect, useState } from "react";
import { events } from "@/lib/fixtures/intel-data";
import type { DataResult, IntelEvent } from "./types";

/**
 * Stage 1 (now): returns fixtures.
 * Stage 2 (later): replace the body with
 *   const rows = await invoke<IntelEvent[]>("list_events", { filters });
 * Callers do not change.
 */
export async function listEvents(): Promise<DataResult<IntelEvent[]>> {
  return { data: events, source: "fixtures" };
}

export async function getEvent(
  id: string,
): Promise<DataResult<IntelEvent | undefined>> {
  return { data: events.find((e) => e.id === id), source: "fixtures" };
}

export function useEvents() {
  const [state, setState] = useState<{
    loading: boolean;
    result?: DataResult<IntelEvent[]>;
  }>({ loading: true });

  useEffect(() => {
    let alive = true;
    listEvents()
      .then((r) => {
        if (alive) setState({ loading: false, result: r });
      })
      .catch((e) => {
        if (alive)
          setState({
            loading: false,
            result: {
              data: [],
              source: "fixtures",
              error: { kind: "unknown", message: String(e), retryable: true },
            },
          });
      });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
