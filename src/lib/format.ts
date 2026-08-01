import type { SourceQuality } from "@/lib/data-client/types";

export function sourceQualityLabel(q: SourceQuality): string {
  return {
    official: "Official",
    reputable: "Reputable",
    third_party: "Third-party",
    unknown: "Unverified",
  }[q];
}
