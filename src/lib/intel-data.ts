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

const now = new Date();
const daysAgo = (n: number) =>
  new Date(now.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

export const companies: IntelCompany[] = [
  {
    id: "skyroot",
    name: "Skyroot Aerospace",
    score: 9,
    sector: ["Launch Vehicles", "Propulsion"],
    location: "Hyderabad, India",
    geography: "India",
    latestSignal: "Series C funding round closed",
    latestActivityAt: daysAgo(0),
    hiring: true,
    website: "https://skyroot.in",
    careers: "https://skyroot.in/careers",
    linkedin: "https://www.linkedin.com/company/skyroot-aerospace",
    officialNews: "https://skyroot.in/news",
    description:
      "Private Indian launch vehicle company developing the Vikram series of small-satellite launchers.",
    status: "BOOKMARKED",
    contacts: [
      {
        id: "c-sky-1",
        name: "Recruiting Team",
        designation: "Talent Acquisition",
        relevance: "GNC / propulsion hiring",
        publicEmail: "careers@skyroot.in",
        emailConfidence: "verified_public",
        linkedin: "https://www.linkedin.com/company/skyroot-aerospace/jobs",
        sourceUrl: "https://skyroot.in/careers",
        dateFound: daysAgo(3),
        outreachStatus: "none",
      },
    ],
  },
  {
    id: "agnikul",
    name: "Agnikul Cosmos",
    score: 8,
    sector: ["Launch Vehicles", "Propulsion"],
    location: "Chennai, India",
    geography: "India",
    latestSignal: "Successful sub-orbital flight test",
    latestActivityAt: daysAgo(1),
    hiring: true,
    website: "https://agnikul.in",
    careers: "https://agnikul.in/careers",
    linkedin: "https://www.linkedin.com/company/agnikul",
    officialNews: "https://agnikul.in/press",
    description:
      "IIT-Madras incubated launch startup building the Agnibaan configurable small-satellite launcher.",
    status: "NEW",
    contacts: [],
  },
  {
    id: "ideaforge",
    name: "ideaForge",
    score: 7,
    sector: ["UAV / Drones", "Defence Electronics"],
    location: "Mumbai, India",
    geography: "India",
    latestSignal: "MoD contract for tactical UAVs",
    latestActivityAt: daysAgo(2),
    hiring: false,
    website: "https://ideaforgetech.com",
    linkedin: "https://www.linkedin.com/company/ideaforge",
    description:
      "Publicly listed Indian UAV manufacturer supplying tactical drones to defence and homeland-security customers.",
    status: "REVIEWED",
    contacts: [
      {
        id: "c-if-1",
        name: "Investor Relations",
        designation: "IR Desk",
        relevance: "Contract disclosures",
        publicEmail: "investors@ideaforgetech.com",
        emailConfidence: "verified_public",
        sourceUrl: "https://ideaforgetech.com/investor-relations",
        dateFound: daysAgo(10),
        outreachStatus: "none",
      },
    ],
  },
  {
    id: "pixxel",
    name: "Pixxel",
    score: 8,
    sector: ["Satellites"],
    location: "Bengaluru, India",
    geography: "India",
    latestSignal: "Hyperspectral satellite constellation launch",
    latestActivityAt: daysAgo(4),
    hiring: true,
    website: "https://pixxel.space",
    careers: "https://pixxel.space/careers",
    linkedin: "https://www.linkedin.com/company/pixxel-space",
    description:
      "Earth-imaging startup building a hyperspectral small-satellite constellation for climate and agriculture analytics.",
    status: "NEW",
    contacts: [],
  },
  {
    id: "anduril",
    name: "Anduril Industries",
    score: 9,
    sector: ["Defence Electronics", "UAV / Drones"],
    location: "Costa Mesa, USA",
    geography: "Global",
    latestSignal: "Awarded US DoD collaborative combat aircraft contract",
    latestActivityAt: daysAgo(1),
    hiring: true,
    website: "https://anduril.com",
    careers: "https://anduril.com/careers",
    linkedin: "https://www.linkedin.com/company/anduril-industries",
    description:
      "US defence technology company building autonomous systems, sensors, and command software for the DoD.",
    status: "BOOKMARKED",
    contacts: [],
  },
  {
    id: "rocketlab",
    name: "Rocket Lab",
    score: 7,
    sector: ["Launch Vehicles", "Satellites"],
    location: "Long Beach, USA",
    geography: "Global",
    latestSignal: "Neutron rocket engine qualification milestone",
    latestActivityAt: daysAgo(6),
    hiring: true,
    website: "https://rocketlabusa.com",
    careers: "https://rocketlabusa.com/careers",
    linkedin: "https://www.linkedin.com/company/rocket-lab",
    description:
      "End-to-end space company operating the Electron launch vehicle and developing the medium-lift Neutron.",
    status: "REVIEWED",
    contacts: [],
  },
  {
    id: "ursa-major",
    name: "Ursa Major",
    score: 6,
    sector: ["Propulsion"],
    location: "Berthoud, USA",
    geography: "Global",
    latestSignal: "Hadley engine delivery to hypersonics customer",
    latestActivityAt: daysAgo(12),
    hiring: false,
    website: "https://ursamajor.com",
    linkedin: "https://www.linkedin.com/company/ursa-major-technologies",
    description:
      "Independent rocket-propulsion company supplying liquid engines to launch and hypersonics customers.",
    status: "NEW",
    contacts: [],
  },
  {
    id: "generic-blogger",
    name: "Unverified Blog Post",
    score: 2,
    sector: ["Avionics"],
    location: "Unknown",
    geography: "Global",
    latestSignal: "Speculative avionics rumour",
    latestActivityAt: daysAgo(20),
    hiring: false,
    description:
      "Low-relevance sample entry to exercise low-score filtering and review triage flow.",
    status: "IGNORED",
    contacts: [],
  },
];

export const events: IntelEvent[] = [
  {
    id: "e1",
    score: 9,
    type: "funding",
    companyId: "skyroot",
    company: "Skyroot Aerospace",
    headline: "Skyroot Aerospace closes Series C to accelerate Vikram-1 cadence",
    summary:
      "Skyroot announced the close of its Series C round, with proceeds directed toward scaling Vikram-1 launch cadence and expanding its Hyderabad propulsion facility.",
    geography: "India",
    sector: ["Launch Vehicles", "Propulsion"],
    publisher: "Company Press Release",
    publishedAt: daysAgo(0),
    sourceUrl: "https://skyroot.in/news",
    sourceQuality: "official",
    status: "NEW",
    scoreBreakdown: [
      { label: "Funding event", points: 4 },
      { label: "Official source", points: 2 },
      { label: "Priority sector: Launch Vehicles", points: 2 },
      { label: "Recency: today", points: 1 },
    ],
  },
  {
    id: "e2",
    score: 8,
    type: "flight_test",
    companyId: "agnikul",
    company: "Agnikul Cosmos",
    headline: "Agnikul completes second sub-orbital Agnibaan flight",
    summary:
      "Agnikul Cosmos reported a successful sub-orbital flight of its Agnibaan SOrTeD vehicle, validating semi-cryogenic engine and avionics performance.",
    geography: "India",
    sector: ["Launch Vehicles"],
    publisher: "Company Press Release",
    publishedAt: daysAgo(1),
    sourceUrl: "https://agnikul.in/press",
    sourceQuality: "official",
    status: "NEW",
    scoreBreakdown: [
      { label: "Flight test milestone", points: 4 },
      { label: "Official source", points: 2 },
      { label: "Priority sector", points: 2 },
    ],
  },
  {
    id: "e3",
    score: 8,
    type: "contract",
    companyId: "ideaforge",
    company: "ideaForge",
    headline: "ideaForge wins Ministry of Defence contract for tactical UAVs",
    summary:
      "ideaForge disclosed a new MoD purchase order for its SWITCH tactical UAV platform, to be delivered over the next four quarters.",
    geography: "India",
    sector: ["UAV / Drones"],
    publisher: "BSE Filing",
    publishedAt: daysAgo(2),
    sourceUrl: "https://www.bseindia.com",
    sourceQuality: "official",
    status: "REVIEWED",
    scoreBreakdown: [
      { label: "Government contract", points: 4 },
      { label: "Regulatory disclosure", points: 2 },
      { label: "Priority sector", points: 2 },
    ],
  },
  {
    id: "e4",
    score: 8,
    type: "product_launch",
    companyId: "pixxel",
    company: "Pixxel",
    headline: "Pixxel deploys next batch of Firefly hyperspectral satellites",
    summary:
      "Pixxel confirmed the deployment of additional Firefly satellites, expanding its hyperspectral constellation revisit and spectral coverage.",
    geography: "India",
    sector: ["Satellites"],
    publisher: "Company Press Release",
    publishedAt: daysAgo(4),
    sourceUrl: "https://pixxel.space",
    sourceQuality: "official",
    status: "NEW",
    scoreBreakdown: [
      { label: "Product launch", points: 3 },
      { label: "Official source", points: 2 },
      { label: "Priority sector", points: 2 },
      { label: "Constellation milestone", points: 1 },
    ],
  },
  {
    id: "e5",
    score: 9,
    type: "contract",
    companyId: "anduril",
    company: "Anduril Industries",
    headline: "Anduril selected for US DoD Collaborative Combat Aircraft program",
    summary:
      "Anduril was named as a prime for a next-phase Collaborative Combat Aircraft development contract with the US Department of Defense.",
    geography: "Global",
    sector: ["UAV / Drones", "Defence Electronics"],
    publisher: "US DoD Newsroom",
    publishedAt: daysAgo(1),
    sourceUrl: "https://www.defense.gov/News",
    sourceQuality: "official",
    status: "BOOKMARKED",
    scoreBreakdown: [
      { label: "Prime contract selection", points: 4 },
      { label: "Official government source", points: 3 },
      { label: "High strategic value", points: 2 },
    ],
  },
  {
    id: "e6",
    score: 6,
    type: "hiring",
    companyId: "rocketlab",
    company: "Rocket Lab",
    headline: "Rocket Lab opens senior GNC engineer roles for Neutron",
    summary:
      "Rocket Lab posted multiple senior Guidance, Navigation and Control engineering roles focused on the Neutron medium-lift vehicle program.",
    geography: "Global",
    sector: ["Launch Vehicles"],
    publisher: "Rocket Lab Careers",
    publishedAt: daysAgo(6),
    sourceUrl: "https://rocketlabusa.com/careers",
    sourceQuality: "official",
    status: "REVIEWED",
    scoreBreakdown: [
      { label: "Priority-role hiring signal", points: 3 },
      { label: "Official source", points: 2 },
      { label: "Priority sector", points: 1 },
    ],
  },
  {
    id: "e7",
    score: 7,
    type: "partnership",
    companyId: "ursa-major",
    company: "Ursa Major",
    headline: "Ursa Major partners with hypersonics prime on Hadley engine",
    summary:
      "Ursa Major announced an expanded partnership to supply its Hadley engine variant to a US hypersonics prime contractor.",
    geography: "Global",
    sector: ["Propulsion"],
    publisher: "SpaceNews",
    publishedAt: daysAgo(12),
    sourceUrl: "https://spacenews.com",
    sourceQuality: "reputable",
    status: "NEW",
    scoreBreakdown: [
      { label: "Strategic partnership", points: 3 },
      { label: "Reputable source", points: 2 },
      { label: "Priority sector", points: 2 },
    ],
  },
  {
    id: "e8",
    score: 7,
    type: "award",
    companyId: "skyroot",
    company: "Skyroot Aerospace",
    headline: "Skyroot recognised at national aerospace innovation awards",
    summary:
      "Skyroot received an aerospace innovation award for its work on the Kalam-100 solid propulsion stage.",
    geography: "India",
    sector: ["Propulsion"],
    publisher: "Industry Body Press Release",
    publishedAt: daysAgo(9),
    sourceUrl: "https://skyroot.in/news",
    sourceQuality: "official",
    status: "NEW",
    scoreBreakdown: [
      { label: "Industry award", points: 2 },
      { label: "Official source", points: 2 },
      { label: "Priority sector", points: 2 },
      { label: "Recency bonus", points: 1 },
    ],
  },
  {
    id: "e9",
    score: 5,
    type: "news",
    companyId: "pixxel",
    company: "Pixxel",
    headline: "Pixxel signs MoU with regional agriculture agency",
    summary:
      "Pixxel signed a memorandum of understanding with a regional agriculture agency to pilot hyperspectral crop-health analytics.",
    geography: "India",
    sector: ["Satellites"],
    publisher: "Regional News Wire",
    publishedAt: daysAgo(15),
    sourceUrl: "https://pixxel.space",
    sourceQuality: "third_party",
    status: "NEW",
    scoreBreakdown: [
      { label: "MoU signal", points: 2 },
      { label: "Third-party source", points: 1 },
      { label: "Priority sector", points: 2 },
    ],
  },
  {
    id: "e10",
    score: 4,
    type: "hiring",
    companyId: "ideaforge",
    company: "ideaForge",
    headline: "ideaForge expanding manufacturing operations team",
    summary:
      "ideaForge listed several manufacturing operations roles associated with expanded UAV assembly capacity.",
    geography: "India",
    sector: ["UAV / Drones"],
    publisher: "Company Careers Page",
    publishedAt: daysAgo(18),
    sourceUrl: "https://ideaforgetech.com/careers",
    sourceQuality: "official",
    status: "NEW",
    scoreBreakdown: [
      { label: "General hiring signal", points: 2 },
      { label: "Official source", points: 2 },
    ],
  },
  {
    id: "e11",
    score: 2,
    type: "news",
    companyId: "generic-blogger",
    company: "Unverified Blog Post",
    headline: "Anonymous blog speculates on unspecified avionics contract",
    summary:
      "A low-authority blog speculates about an unnamed avionics contract without primary sourcing.",
    geography: "Global",
    sector: ["Avionics"],
    publisher: "Unknown Blog",
    publishedAt: daysAgo(21),
    sourceUrl: "https://example.com",
    sourceQuality: "unknown",
    status: "IGNORED",
    scoreBreakdown: [
      { label: "Speculative claim", points: 1 },
      { label: "Unknown source authority", points: 1 },
    ],
  },
  {
    id: "e12",
    score: 6,
    type: "news",
    companyId: "anduril",
    company: "Anduril Industries",
    headline: "Anduril feature coverage in defence analyst briefing (source unavailable)",
    summary:
      "Analyst briefing discussed Anduril's roadmap. Original briefing URL not archived; awaiting canonical source before publishing externally.",
    geography: "Global",
    sector: ["Defence Electronics"],
    publisher: "Analyst Briefing",
    publishedAt: daysAgo(8),
    sourceUrl: null,
    sourceQuality: "unknown",
    status: "NEW",
    scoreBreakdown: [
      { label: "Analyst mention", points: 2 },
      { label: "Priority sector", points: 2 },
      { label: "No canonical source", points: 2 },
    ],
  },
];

export function eventTypeLabel(t: EventType): string {
  return {
    funding: "Funding",
    hiring: "Hiring",
    contract: "Contract",
    partnership: "Partnership",
    product_launch: "Product Launch",
    flight_test: "Flight Test",
    award: "Award",
    news: "News",
  }[t];
}

export function sourceQualityLabel(q: SourceQuality): string {
  return {
    official: "Official",
    reputable: "Reputable",
    third_party: "Third-party",
    unknown: "Unverified",
  }[q];
}
