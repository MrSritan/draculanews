import { useEffect, useState } from "react";
import { INTERNSHIPS } from "@/lib/fixtures/internships-data";
import type { DataResult, InternshipProgram } from "./types";

/**
 * Stage 1 (now): returns fixtures.
 * Stage 2 (later): replace the body with
 *   const rows = await invoke<InternshipProgram[]>("list_opportunities", { filters });
 * Callers do not change.
 */
export async function listOpportunities(): Promise<
  DataResult<InternshipProgram[]>
> {
  return { data: INTERNSHIPS, source: "fixtures" };
}

export async function getOpportunity(
  id: string,
): Promise<DataResult<InternshipProgram | undefined>> {
  return { data: INTERNSHIPS.find((p) => p.id === id), source: "fixtures" };
}

export function useOpportunities() {
  const [state, setState] = useState<{
    loading: boolean;
    result?: DataResult<InternshipProgram[]>;
  }>({ loading: true });

  useEffect(() => {
    let alive = true;
    listOpportunities()
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
