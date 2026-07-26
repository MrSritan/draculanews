import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { DATE_RANGES, GEOGRAPHIES, SECTORS } from "@/lib/intel-data";

type DateRangeId = (typeof DATE_RANGES)[number]["id"];
type GeographyId = (typeof GEOGRAPHIES)[number];
type SectorId = (typeof SECTORS)[number];

interface FiltersState {
  dateRange: DateRangeId;
  minScore: number;
  sector: SectorId;
  geography: GeographyId;
}

interface FiltersCtx extends FiltersState {
  setDateRange: (v: DateRangeId) => void;
  setMinScore: (v: number) => void;
  setSector: (v: SectorId) => void;
  setGeography: (v: GeographyId) => void;
}

const Ctx = createContext<FiltersCtx | null>(null);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRangeId>("today");
  const [minScore, setMinScore] = useState(4);
  const [sector, setSector] = useState<SectorId>("All");
  const [geography, setGeography] = useState<GeographyId>("India + Global");

  const value = useMemo(
    () => ({
      dateRange,
      minScore,
      sector,
      geography,
      setDateRange,
      setMinScore,
      setSector,
      setGeography,
    }),
    [dateRange, minScore, sector, geography],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFilters() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useFilters must be used within FiltersProvider");
  return v;
}

export function dateRangeDays(id: DateRangeId): number {
  return DATE_RANGES.find((d) => d.id === id)?.days ?? 9999;
}
