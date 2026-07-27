import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DigestView } from "@/components/DigestView";

export const Route = createFileRoute("/digest/monthly")({
  head: () => ({
    meta: [
      { title: "Monthly Digest | Aerospace & Defence Intelligence" },
      {
        name: "description",
        content:
          "Top aerospace and defence signals from the past 30 days scoring 8 or above.",
      },
      { property: "og:title", content: "Monthly Digest | Aerospace & Defence Intelligence" },
      {
        property: "og:description",
        content:
          "Top aerospace and defence signals from the past 30 days scoring 8 or above.",
      },
    ],
  }),
  component: MonthlyDigestPage,
});

function MonthlyDigestPage() {
  return (
    <DashboardLayout>
      <DigestView title="Monthly Digest" days={30} minScore={8} />
    </DashboardLayout>
  );
}
