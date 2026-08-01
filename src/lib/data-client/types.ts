/** Shared entity models and the result wrapper every data client returns. */

export type EventType =
  | "funding"
  | "hiring"
  | "contract"
  | "partnership"
  | "product_launch"
  | "flight_test"
  | "award"
  | "news";

export type Geography = "India" | "Global";
export type ReviewStatus = "NEW" | "REVIEWED" | "BOOKMARKED" | "IGNORED";
export type SourceQuality = "official" | "reputable" | "third_party" | "unknown";

export interface ScoreReason {
  label: string;
  points: number;
}

export interface IntelEvent {
  id: string;
  score: number; // 0-10
  type: EventType;
  companyId: string;
  company: string;
  headline: string;
  summary: string;
  geography: Geography;
  sector: string[];
  publisher: string;
  publishedAt: string; // ISO
  sourceUrl: string | null;
  sourceQuality: SourceQuality;
  status: ReviewStatus;
  scoreBreakdown: ScoreReason[];
}

export type ContactConfidence = "verified_public" | "probable";

export interface IntelContact {
  id: string;
  name: string;
  designation: string;
  relevance: string;
  publicEmail?: string;
  emailConfidence: ContactConfidence;
  linkedin?: string;
  officialProfileUrl?: string;
  sourceUrl?: string;
  dateFound: string;
  outreachStatus: "none" | "queued" | "sent" | "replied";
}

export interface IntelCompany {
  id: string;
  name: string;
  score: number;
  sector: string[];
  location: string;
  geography: Geography;
  latestSignal: string;
  latestActivityAt: string;
  hiring: boolean;
  website?: string;
  careers?: string;
  linkedin?: string;
  github?: string;
  officialNews?: string;
  description: string;
  status: ReviewStatus;
  contacts: IntelContact[];
}

export type ProgramStatus = "open" | "closed" | "rolling" | "announced";
export type FundingLevel = "fully-funded" | "stipend" | "partial";

export interface InternshipProgram {
  id: string;
  name: string;
  country: string;
  flag: string;
  organisation: string;
  isGovernment: boolean;
  summary: string;
  stipend: string;
  fundingLevel: FundingLevel;
  covers: string[];
  duration: string;
  disciplines: string[];
  eligibility: string[];
  applicationWindow: string;
  deadlineNote: string;
  status: ProgramStatus;
  officialUrl: string;
}

export const SECTORS = [
  "All",
  "Launch Vehicles",
  "Satellites",
  "Propulsion",
  "UAV / Drones",
  "Avionics",
  "Defence Electronics",
  "Materials",
  "Ground Systems",
] as const;

export const DATE_RANGES = [
  { id: "today", label: "Today", days: 1 },
  { id: "7d", label: "Last 7 days", days: 7 },
  { id: "30d", label: "Last 30 days", days: 30 },
  { id: "90d", label: "Last 90 days", days: 90 },
  { id: "all", label: "All time", days: 9999 },
] as const;

export const GEOGRAPHIES = ["India + Global", "India", "Global"] as const;

export type DataSource = "fixtures" | "sqlite";

export interface DataResult<T> {
  data: T;
  source: DataSource;
  /** ISO timestamp of the last successful collection run, when known. */
  lastRunAt?: string;
  /** Set when the underlying source failed; data may be stale or empty. */
  error?: DataError;
}

export type DataErrorKind =
  | "db-unavailable"
  | "db-locked"
  | "no-run-yet"
  | "last-run-failed"
  | "unknown";

export interface DataError {
  kind: DataErrorKind;
  message: string;
  retryable: boolean;
}
