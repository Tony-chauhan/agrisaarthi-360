import { PageHeader } from "@/components/ui/page-header";
import { TimelineFeed } from "@/components/timeline/timeline-feed";

export const metadata = {
  title: "Farm Timeline — AgriSaarthi 360",
  description: "Chronological record of your farm actions with verifiable provenance.",
};

export default function TimelinePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        eyebrow="Farm → Decision → Action → Plan → Proof"
        title="Farm Timeline"
        description="Every action you take in the app appears here in order. Important events can be verified into a tamper-evident farm record."
      />
      <TimelineFeed />
    </div>
  );
}
