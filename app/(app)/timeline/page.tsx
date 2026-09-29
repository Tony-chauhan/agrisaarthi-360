"use client";

import { PageHeader } from "@/components/ui/page-header";
import { TimelineFeed } from "@/components/timeline/timeline-feed";
import { useLanguage } from "@/lib/i18n/language-context";

export default function TimelinePage() {
  const { t } = useLanguage();
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        eyebrow={t.timeline.eyebrow}
        title={t.timeline.title}
        description={t.timeline.description}
      />
      <TimelineFeed />
    </div>
  );
}
