import { useEffect, useState } from "react";
import { companies } from "@/lib/fixtures/intel-data";
import type { DataResult, IntelCompany } from "./types";

/**
 * Stage 1 (now): returns fixtures.
 * Stage 2 (later): replace the body with
 *   const rows = await invoke<IntelCompany[]>("list_companies", { filters });
 * Callers do not change.
 */
export async function listCompanies(): Promise<DataResult<IntelCompany[]>> {
  return { data: companies, source: "fixtures" };
}

export async function getCompany(
  id: string,
): Promise<DataResult<IntelCompany | undefined>> {
  return { data: companies.find((c) => c.id === id), source: "fixtures" };
}

export function useCompanies() {
  const [state, setState] = useState<{
    loading: boolean;
    result?: DataResult<IntelCompany[]>;
  }>({ loading: true });

  useEffect(() => {
    let alive = true;
    listCompanies()
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
