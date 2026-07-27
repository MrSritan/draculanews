import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DigestView } from "@/components/DigestView";

export const Route = createFileRoute("/digest/weekly")({
  head: () => ({
    meta: [
      { title: "Weekly Digest | Aerospace & Defence Intelligence" },
      {
        name: "description",
        content:
          "Top aerospace and defence signals from the past 7 days scoring 8 or above.",
      },
      { property: "og:title", content: "Weekly Digest | Aerospace & Defence Intelligence" },
      {
        property: "og:description",
        content:
          "Top aerospace and defence signals from the past 7 days scoring 8 or above.",
      },
    ],
  }),
  component: WeeklyDigestPage,
});

function WeeklyDigestPage() {
  return (
    <DashboardLayout>
      <DigestView title="Weekly Digest" days={7} minScore={8} />
    </DashboardLayout>
  );
}
