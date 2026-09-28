"use client";

import Link from "next/link";
import { MessageCircleHeart, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { DataSourceTag } from "@/components/ui/badge";
import { useFarmProfile } from "@/lib/farm-context";

/**
 * AssistantEntryCard — state-driven dashboard entry to the assistant.
 * Before first interaction: "Ask AgriSaarthi" with a suggested question.
 * After a question: compact latest interaction summary. Deliberately small.
 */

const SUGGESTED_QUESTION = "What should I do today?";

export function AssistantEntryCard() {
  const { profile, latestAssistantInteraction } = useFarmProfile();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ask AgriSaarthi</CardTitle>
      </CardHeader>
      <CardContent>
        {latestAssistantInteraction ? (
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-canopy-50 text-canopy-600">
              <MessageCircleHeart className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-loam-500">
                Latest question
              </p>
              <p className="mt-0.5 text-sm font-semibold text-canopy-900">
                &ldquo;{latestAssistantInteraction.question}&rdquo;
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-loam-600">
                {latestAssistantInteraction.answerPreview}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <DataSourceTag source={latestAssistantInteraction.source} />
                <span className="flex items-center gap-1 text-[11px] text-loam-500">
                  <CheckCircle2 className="h-3 w-3" aria-hidden />
                  answered
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-canopy-50 text-canopy-600">
              <MessageCircleHeart className="h-6 w-6" aria-hidden />
            </div>
            <p className="text-sm leading-relaxed text-loam-700">
              {profile.selectedCrop
                ? `I know your ${profile.farmSizeAcres}-acre ${profile.selectedCrop} farm in ${profile.location.split(",")[0]} — ask about irrigation, crop checks or operations.`
                : "Ask about irrigation, crop checks or farm operations — answers use your farm context when available."}
            </p>
          </div>
        )}
        {!latestAssistantInteraction ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            <li className="rounded-full border border-canopy-200 bg-canopy-50 px-3 py-1.5 text-xs font-medium text-canopy-800">
              &ldquo;{SUGGESTED_QUESTION}&rdquo;
            </li>
            <li className="rounded-full border border-canopy-200 bg-canopy-50 px-3 py-1.5 text-xs font-medium text-canopy-800">
              &ldquo;Is irrigation needed?&rdquo;
            </li>
          </ul>
        ) : null}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-loam-500">AI model — not expert advice</p>
        <Link
          href="/assistant"
          className="flex cursor-pointer items-center gap-1 text-sm font-medium text-terracotta-600 hover:underline"
        >
          Open assistant
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </CardFooter>
    </Card>
  );
}
