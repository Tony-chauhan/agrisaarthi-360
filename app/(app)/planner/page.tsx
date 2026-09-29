"use client";

import { PageHeader } from "@/components/ui/page-header";
import { PlannerBoard } from "@/components/planner/planner-board";
import { useLanguage } from "@/lib/i18n/language-context";

export default function PlannerPage() {
  const { t } = useLanguage();
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        eyebrow={t.planner.eyebrow}
        title={t.planner.title}
        description={t.planner.description}
      />
      <PlannerBoard />
    </div>
  );
}
