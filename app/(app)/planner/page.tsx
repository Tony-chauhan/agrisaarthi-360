import { PageHeader } from "@/components/ui/page-header";
import { PlannerBoard } from "@/components/planner/planner-board";

export const metadata = {
  title: "Farm Planner — AgriSaarthi 360",
  description: "Today's plan, this week and weather-aware tasks from your farm context.",
};

export default function PlannerPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        eyebrow="Farm → Decision → Action → Plan"
        title="Farm Planner"
        description="Your farm context converted into contextual upcoming actions — today, this week and weather-aware. Every task shows why it exists."
      />
      <PlannerBoard />
    </div>
  );
}
