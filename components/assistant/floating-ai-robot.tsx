"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bot, X, SendHorizontal, Maximize2, ListChecks, TriangleAlert, Sparkles } from "lucide-react";
import { useFarmProfile } from "@/lib/farm-context";
import { useWeather } from "@/lib/weather/use-weather";
import { deriveFarmWeatherAction } from "@/lib/weather/weather-actions";
import { describeWeatherCode } from "@/lib/weather/weather-utils";
import { buildAssistantContext } from "@/lib/assistant/assistant-context";
import type { AssistantResponse } from "@/lib/assistant/types";
import { usePlanner } from "@/lib/planner/task-store";
import { useLanguage } from "@/lib/i18n/language-context";
import { DataSourceTag } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

/**
 * FLOATING AI ROBOT (P1.5)
 *
 * Global quick-access entry to the EXISTING assistant pipeline:
 * same AssistantContextPacket → same /api/assistant → same Gemini/fallback
 * providers → same normalization. No second AI backend. The /assistant
 * page remains; the panel expands to it.
 *
 * AI task suggestions are SUGGESTIONS ONLY — adding to the planner
 * requires explicit user confirmation (no autonomous irreversible actions).
 */

interface PanelMessage {
  id: string;
  role: "farmer" | "assistant";
  text: string;
  response?: AssistantResponse;
}

const QUICK_PROMPTS_EN = [
  "What should I do today?",
  "Should I irrigate?",
  "What should I check in my wheat crop?",
] as const;

const QUICK_PROMPTS_HI = [
  "आज मैं क्या करूं?",
  "क्या सिंचाई करूं?",
  "मेरी फसल में क्या जांचूं?",
] as const;

export function FloatingAiRobot() {
  const { profile, latestHealthCheck, latestOperation, hasCompleteProfile } =
    useFarmProfile();
  const { addTask } = usePlanner();
  const { snapshot } = useWeather(profile.location);
  const { t, lang } = useLanguage();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<PanelMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [addedActions, setAddedActions] = useState<Set<string>>(new Set());

  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /* Hide the launcher on the full assistant page (it IS the expanded view). */
  const pathname = usePathname();
  if (pathname === "/assistant") return null;

  const weatherContext = useMemo(
    () =>
      snapshot
        ? (() => {
            const action = deriveFarmWeatherAction(snapshot, profile, lang);
            const rain = snapshot.forecast[0]?.precipitationProbabilityPercent;
            return {
              summary: [
                `${Math.round(snapshot.current.temperatureC)}°C`,
                describeWeatherCode(snapshot.current.weatherCode, lang).toLowerCase(),
                rain !== undefined
                  ? lang === "hi"
                    ? `आज ${rain}% बारिश की संभावना`
                    : `${rain}% rain probability today`
                  : null,
              ]
                .filter(Boolean)
                .join(", "),
              actionTitle: action.title,
              actionMessage: action.message,
              isLive: !snapshot.isFallback,
            };
          })()
        : null,
    [snapshot, profile, lang]
  );

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      setMessages((prev) => [
        ...prev,
        { id: `f-${Date.now()}`, role: "farmer", text: trimmed },
      ]);
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
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = (await res.json()) as AssistantResponse;
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: "assistant", text: data.answer, response: data },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            text: t.assistantPage.unavailable,
          },
        ]);
      } finally {
        setIsTyping(false);
        window.setTimeout(() => inputRef.current?.focus(), 50);
      }
    },
    [profile, latestHealthCheck, latestOperation, weatherContext, isTyping, lang, t]
  );

  /* Keyboard: Escape closes the panel. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const greeting = hasCompleteProfile
    ? `Namaste ${profile.farmerName.split(" ")[0]} — how can I help with your${
        profile.selectedCrop ? ` ${profile.selectedCrop.toLowerCase()}` : ""
      } farm today?`
    : "How can I help? Set up your farm profile for context-aware answers.";

  return (
    <>
      {/* ------------------------------ Panel ------------------------------ */}
      {open ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={t.robot.panelAria}
          className="fixed bottom-24 right-4 z-50 flex h-[min(560px,calc(100dvh-11rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-canopy-100 bg-white shadow-deep sm:bottom-24 sm:right-6"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-canopy-100 bg-canopy-950 px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canopy-800 ring-1 ring-sprout-400/40">
                <Bot className="h-4.5 w-4.5 text-sprout-400" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">AgriSaarthi AI</p>
                <p className="truncate text-xs text-canopy-100/80">
                  {t.robot.connected}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => router.push("/assistant")}
                aria-label={t.robot.expandAria}
                title={t.robot.expandTitle}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-canopy-100 transition-colors hover:bg-white/10"
              >
                <Maximize2 className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.robot.closeAria}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-canopy-100 transition-colors hover:bg-white/10"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 py-3"
            role="log"
            aria-live="polite"
            aria-label={t.assistantPage.conversationAria}
          >
            <p className="mx-auto mb-3 w-fit rounded-full bg-canopy-50 px-3 py-1 text-xs text-canopy-700">
              {greeting}
            </p>
            {messages.length === 0 ? (
              <ul className="flex flex-col gap-2" aria-label={t.robot.quickPromptsAria}>
                {(lang === "hi" ? QUICK_PROMPTS_HI : QUICK_PROMPTS_EN).map((q) => (
                  <li key={q}>
                    <button
                      type="button"
                      onClick={() => void send(q)}
                      className="w-full cursor-pointer rounded-xl border border-canopy-200 bg-canopy-50/60 px-3 py-2.5 text-left text-sm font-medium text-canopy-800 transition-colors hover:border-canopy-400 hover:bg-canopy-100"
                    >
                      {q}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {messages.map((m) => (
                  <li key={m.id} className="flex flex-col gap-1">
                    <div
                      className={cn(
                        "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                        m.role === "farmer"
                          ? "self-end bg-canopy-800 text-white"
                          : "self-start bg-canopy-50 text-canopy-950"
                      )}
                    >
                      {m.text}
                    </div>
                    {m.role === "assistant" && m.response ? (
                      <div className="flex max-w-[88%] flex-col gap-1.5 self-start">
                        {m.response.actions.length > 0 ? (
                          <ul className="flex flex-col gap-1 rounded-xl border border-canopy-200 bg-white px-3 py-2">
                            {m.response.actions.map((action) => {
                              const key = `${m.id}:${action}`;
                              const added = addedActions.has(key);
                              return (
                                <li key={action} className="flex items-start justify-between gap-2">
                                  <span className="flex items-start gap-1.5 text-xs text-loam-700">
                                    <ListChecks className="mt-0.5 h-3.5 w-3.5 shrink-0 text-canopy-600" aria-hidden />
                                    {action}
                                  </span>
                                  {added ? (
                                    <span className="shrink-0 text-xs font-medium text-sprout-600">
                                      {t.robot.added}
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        addTask({
                                          title: action,
                                          description: t.robot.suggestedBy(
                                            m.response?.answer.slice(0, 120) ?? "",
                                          ),
                                          category: "assistant",
                                          dueAt: new Date().toISOString().slice(0, 10),
                                          priority: "medium",
                                          source: "assistant",
                                          sourceLabel: m.response?.source ?? "model-result",
                                        });
                                        setAddedActions((prev) => new Set(prev).add(key));
                                      }}
                                      className="shrink-0 cursor-pointer rounded-md border border-canopy-200 px-2 py-1 text-xs font-medium text-canopy-700 hover:bg-canopy-50"
                                      aria-label={t.robot.addToPlanAria(action)}
                                    >
                                      {t.robot.addToPlan}
                                    </button>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        ) : null}
                        <div className="flex items-center gap-2">
                          <DataSourceTag source={m.response.source} />
                          {m.response.caveat ? (
                            <span className="flex items-start gap-1 text-xs text-harvest-600">
                              <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                              {m.response.caveat}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </li>
                ))}
                {isTyping ? (
                  <li className="flex items-center gap-2 self-start rounded-2xl bg-canopy-50 px-3.5 py-2.5" aria-label={t.assistantPage.typingAria}>
                    <span className="flex items-center gap-1">
                      <span className="typing-dot h-2 w-2 rounded-full bg-canopy-600" />
                      <span className="typing-dot h-2 w-2 rounded-full bg-canopy-600" />
                      <span className="typing-dot h-2 w-2 rounded-full bg-canopy-600" />
                    </span>
                    <span className="text-xs text-loam-600">{t.assistantPage.thinking}</span>
                  </li>
                ) : null}
              </ul>
            )}
          </div>

          {/* Composer */}
          <form
            className="flex items-center gap-2 border-t border-canopy-100 px-3 py-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <label htmlFor="floating-assistant-input" className="sr-only">
              {t.assistantPage.inputAria}
            </label>
            <input
              ref={inputRef}
              id="floating-assistant-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.robot.inputPlaceholder}
              maxLength={500}
              className="h-11 min-w-0 flex-1 rounded-xl border border-canopy-200 bg-white px-3 text-base text-loam-900 placeholder:text-loam-400 focus:border-canopy-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              aria-label={t.assistantPage.sendAria}
              className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-terracotta-600 text-white transition-colors hover:bg-terracotta-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SendHorizontal className="h-4 w-4" aria-hidden />
            </button>
          </form>
        </div>
      ) : null}

      {/* ----------------------------- Launcher ---------------------------- */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.robot.launcherAria}
        aria-expanded={open}
        title={t.chrome.askAgriSaarthi}
        className={cn(
          "group fixed bottom-24 right-4 z-50 flex h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-full shadow-deep transition-transform hover:scale-105 lg:bottom-6 lg:right-6",
          "border border-sprout-400/50 bg-gradient-to-br from-canopy-800 to-canopy-950",
          "ring-4 ring-sprout-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sprout-400"
        )}
        style={{ bottom: "calc(6rem + env(safe-area-inset-bottom))" }}
      >
        <Bot className="h-6 w-6 text-sprout-400 drop-shadow-[0_0_6px_rgba(74,222,128,0.45)]" aria-hidden />
        {/* AI ready status indicator */}
        <span
          className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-sprout-500"
          aria-hidden
        />
        <span className="pointer-events-none absolute right-full mr-2 hidden whitespace-nowrap rounded-lg bg-canopy-950 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 lg:block">
          {t.chrome.askAgriSaarthi}
        </span>
        <span className="sr-only">{t.robot.launcherAria}</span>
      </button>
    </>
  );
}

