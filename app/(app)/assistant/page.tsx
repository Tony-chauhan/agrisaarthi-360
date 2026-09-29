"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  SendHorizontal,
  MessageCircleHeart,
  Sparkles,
  TriangleAlert,
  ListChecks,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataSourceTag } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { useFarmProfile } from "@/lib/farm-context";
import { useWeather } from "@/lib/weather/use-weather";
import { deriveFarmWeatherAction } from "@/lib/weather/weather-actions";
import { describeWeatherCode } from "@/lib/weather/weather-utils";
import type { Lang } from "@/lib/i18n/types";
import { buildAssistantContext } from "@/lib/assistant/assistant-context";
import { useLanguage } from "@/lib/i18n/language-context";
import type { AssistantResponse } from "@/lib/assistant/types";
import { cn } from "@/lib/cn";

/**
 * AgriSaarthi Assistant — controlled, context-aware agriculture chat.
 * One user message → one /api/assistant request → normalized response.
 * Chat history is local to this page only; nothing is persisted.
 */

interface ChatEntry {
  id: string;
  role: "farmer" | "assistant";
  text: string;
  response?: AssistantResponse;
  /** True when a real provider failed and fallback guidance was shown instead. */
  showedFallbackNotice?: boolean;
}

const SUGGESTED_QUESTIONS_EN = [
  "What should I do today?",
  "Is irrigation needed?",
  "What should I check in my crop?",
];

const SUGGESTED_QUESTIONS_HI = [
  "आज मैं क्या करूं?",
  "क्या सिंचाई ज़रूरी है?",
  "मेरी फसल में क्या जांचूं?",
];

function buildWeatherSummary(
  snapshot: NonNullable<
    ReturnType<typeof useWeather>["snapshot"]
  >,
  profile: ReturnType<typeof useFarmProfile>["profile"],
  lang: Lang = "en"
): { summary: string; actionTitle: string; actionMessage: string; isLive: boolean } | null {
  const action = deriveFarmWeatherAction(snapshot, profile, lang);
  const rain = snapshot.forecast[0]?.precipitationProbabilityPercent;
  const summary = [
    `${Math.round(snapshot.current.temperatureC)}°C`,
    describeWeatherCode(snapshot.current.weatherCode, lang).toLowerCase(),
    rain !== undefined
      ? lang === "hi"
        ? `आज ${rain}% बारिश की संभावना`
        : `${rain}% rain probability today`
      : null,
  ]
    .filter(Boolean)
    .join(", ");
  return {
    summary,
    actionTitle: action.title,
    actionMessage: action.message,
    isLive: !snapshot.isFallback,
  };
}

export default function AssistantPage() {
  const {
    profile,
    hasCompleteProfile,
    latestHealthCheck,
    latestOperation,
    setLatestAssistantInteraction,
  } = useFarmProfile();
  const { snapshot } = useWeather(profile.location);
  const { t, lang } = useLanguage();

  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const weatherContext = useMemo(
    () => (snapshot ? buildWeatherSummary(snapshot, profile, lang) : null),
    [snapshot, profile, lang]
  );

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const farmerMsg: ChatEntry = {
      id: `f-${Date.now()}`,
      role: "farmer",
      text: trimmed,
    };
    setMessages((prev) => [...prev, farmerMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const context = buildAssistantContext(profile, {
        latestHealthCheck,
        latestOperation,
        weather: weatherContext,
      });

      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, context, uiLanguage: lang }),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = (await res.json()) as AssistantResponse;

      // Lightweight dashboard summary — no chat history is stored.
      setLatestAssistantInteraction({
        question: trimmed,
        answerPreview: data.answer.slice(0, 120),
        source: data.source,
        isFallback: data.isFallback,
        at: new Date().toISOString(),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: data.answer,
          response: data,
          showedFallbackNotice: data.isFallback,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: t.assistantPage.unavailable,
          showedFallbackNotice: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-16rem)] min-h-[480px] max-w-3xl flex-col gap-6">
      <PageHeader
        eyebrow={t.assistantPage.eyebrow}
        title={t.assistantPage.title}
        description={t.assistantPage.description}
      />

      {!hasCompleteProfile ? (
        <Alert tone="warning" title={t.assistantPage.profileIncompleteTitle}>
          {t.assistantPage.profileIncompleteBody}
          <div className="mt-2">
            <Link href="/farm-profile">
              <Button size="sm" variant="accent">
                {t.assistantPage.completeProfile}
              </Button>
            </Link>
          </div>
        </Alert>
      ) : null}

      <div className="card-surface flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Context strip */}
        <div className="flex flex-wrap items-center gap-2 border-b border-canopy-100 px-5 py-3">
          <p className="flex items-center gap-2 text-sm text-loam-600">
            <MessageCircleHeart className="h-4 w-4 text-canopy-600" aria-hidden />
            {t.assistantPage.farmLabel}
            {hasCompleteProfile
              ? `${profile.farmSizeAcres} ${t.common.acres}`
              : t.assistantPage.notSet}
          </p>
          <span className="text-canopy-200" aria-hidden>
            ·
          </span>
          <p className="text-sm text-loam-600">
            {hasCompleteProfile ? profile.location : t.assistantPage.locationNotSet}
          </p>
          <span className="text-canopy-200" aria-hidden>
            ·
          </span>
          <p className="text-sm text-loam-600">
            {t.assistantPage.cropLabel}
            {profile.selectedCrop ?? t.assistantPage.notSelected}
          </p>
          <span className="text-canopy-200" aria-hidden>
            ·
          </span>
          <p className="text-sm text-loam-600">
            {t.assistantPage.seasonLabel}
            {profile.season}
          </p>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-5 py-4"
          role="log"
          aria-live="polite"
          aria-label={t.assistantPage.conversationAria}
        >
          <ul className="flex flex-col gap-3">
            {messages.map((m) => (
              <li key={m.id} className="flex flex-col gap-1">
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    m.role === "farmer"
                      ? "self-end bg-canopy-800 text-white"
                      : "self-start bg-canopy-50 text-canopy-950"
                  )}
                >
                  {m.text}
                </div>
                {m.role === "assistant" && m.response ? (
                  <div className="flex max-w-[85%] flex-col gap-1.5 self-start">
                    {m.response.actions.length > 0 ? (
                      <ul className="flex flex-col gap-1 rounded-xl border border-canopy-200 bg-white px-3.5 py-2.5">
                        {m.response.actions.map((action) => (
                          <li
                            key={action}
                            className="flex items-start gap-1.5 text-xs text-loam-700"
                          >
                            <ListChecks
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-canopy-600"
                              aria-hidden
                            />
                            {action}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {m.response.caveat ? (
                      <p className="flex items-start gap-1.5 text-xs text-harvest-600">
                        <TriangleAlert
                          className="mt-0.5 h-3.5 w-3.5 shrink-0"
                          aria-hidden
                        />
                        {m.response.caveat}
                      </p>
                    ) : null}
                    <div className="flex items-center gap-2">
                      <DataSourceTag source={m.response.source} />
                      {m.showedFallbackNotice ? (
                        <span className="text-xs text-loam-500">
                          {t.assistantPage.fallbackShown}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </li>
            ))}
            {isTyping ? (
              <li
                className="flex items-center gap-2 self-start rounded-2xl bg-canopy-50 px-4 py-3"
                aria-label={t.assistantPage.typingAria}
              >
                <span className="flex items-center gap-1">
                  <span className="typing-dot h-2 w-2 rounded-full bg-canopy-600" />
                  <span className="typing-dot h-2 w-2 rounded-full bg-canopy-600" />
                  <span className="typing-dot h-2 w-2 rounded-full bg-canopy-600" />
                </span>
                <span className="text-xs text-loam-600">
                  {t.assistantPage.thinking}
                </span>
              </li>
            ) : null}
          </ul>
        </div>

        {/* Suggested questions */}
        {messages.length === 0 ? (
          <div className="border-t border-canopy-100 px-5 py-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-loam-500">
              <Sparkles className="h-3.5 w-3.5 text-terracotta-600" aria-hidden />
              {t.assistantPage.tryAsking}
            </p>
            <ul className="flex flex-wrap gap-2">
              {(lang === "hi" ? SUGGESTED_QUESTIONS_HI : SUGGESTED_QUESTIONS_EN).map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    onClick={() => sendMessage(q)}
                    disabled={isTyping}
                    className="cursor-pointer rounded-full border border-canopy-200 bg-canopy-50 px-3 py-1.5 text-xs font-medium text-canopy-800 transition-colors hover:border-canopy-400 hover:bg-canopy-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Composer */}
        <form
          className="flex items-center gap-2 border-t border-canopy-100 px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            void sendMessage(input);
          }}
        >
          <label htmlFor="assistant-input" className="sr-only">
            {t.assistantPage.inputAria}
          </label>
          <input
            id="assistant-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.assistantPage.inputPlaceholder}
            maxLength={500}
            className="h-11 flex-1 rounded-xl border border-canopy-200 bg-white px-3.5 text-base text-loam-900 placeholder:text-loam-400 transition-colors focus:border-canopy-500 focus:outline-none"
          />
          <Button
            type="submit"
            variant="accent"
            size="md"
            loading={isTyping}
            disabled={!input.trim()}
            aria-label={t.assistantPage.sendAria}
          >
            {!isTyping && <SendHorizontal className="h-4 w-4" aria-hidden />}
            <span className="hidden sm:inline">{t.common.send}</span>
          </Button>
        </form>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-loam-500">
          {t.assistantPage.footerNote}
        </p>
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-terracotta-600 hover:underline"
        >
          {t.assistantPage.backToDashboard}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
