"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sprout, Bot } from "lucide-react";
import { cn } from "@/lib/cn";
import { NAV_ITEMS } from "@/lib/nav-config";
import { useLanguage } from "@/lib/i18n/language-context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { SidebarFarmCard } from "@/app/(app)/components/sidebar-farm-card";
import { FarmSummaryStatusLine } from "@/app/(app)/components/farm-status-line";

/**
 * WORKSPACE SHELL — the premium product chrome.
 * Deep-emerald sidebar with the current-farm card, contextual topbar,
 * and a compact mobile bottom navigation. Reference-inspired (light SaaS
 * clarity × premium emerald platform) but built on the existing nav
 * config, providers and routes.
 */

/* ------------------------------------------------------------------ */
/* Product identity mark                                               */
/* ------------------------------------------------------------------ */

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2.5 rounded-lg focus-visible:outline-offset-4"
      aria-label={t.chrome.brandAria}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lime ring-1 ring-white/15">
        <Sprout className="h-5 w-5" aria-hidden />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block font-display text-base font-semibold tracking-tight text-white">
            AgriSaarthi <span className="text-lime">360</span>
          </span>
          <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-white/50">
            {t.chrome.chainTagline}
          </span>
        </span>
      )}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Sidebar — desktop                                                   */
/* ------------------------------------------------------------------ */

/** Localized label/description for a nav item (href-keyed). */
function useNavItemText() {
  const { t } = useLanguage();
  const n = t.nav;
  const BY_HREF: Record<string, { label: string; description: string }> = {
    "/dashboard": { label: n.dashboard, description: n.dashboardDesc },
    "/farm-profile": { label: n.farmProfile, description: n.farmProfileDesc },
    "/crop-advisor": { label: n.cropAdvisor, description: n.cropAdvisorDesc },
    "/crop-health": { label: n.cropHealth, description: n.cropHealthDesc },
    "/weather": { label: n.weather, description: n.weatherDesc },
    "/operations": { label: n.operations, description: n.operationsDesc },
    "/planner": { label: n.planner, description: n.plannerDesc },
    "/timeline": { label: n.timeline, description: n.timelineDesc },
    "/assistant": { label: n.assistant, description: n.assistantDesc },
  };
  return (href: string) => BY_HREF[href] ?? null;
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const textFor = useNavItemText();
  return (
    <nav aria-label={t.nav.primary} className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        const text = textFor(item.href) ?? { label: item.label, description: item.description };
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-200",
              active
                ? "bg-white/10 font-semibold text-white ring-1 ring-lime/30"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "h-4 w-1 shrink-0 rounded-full transition-colors",
                active ? "bg-lime" : "bg-transparent group-hover:bg-white/20"
              )}
            />
            <Icon
              className={cn(
                "h-[18px] w-[18px] shrink-0",
                active ? "text-lime" : "text-white/50 group-hover:text-white/80"
              )}
              aria-hidden
            />
            <span className="flex flex-col">
              <span>{text.label}</span>
              <span
                className={cn(
                  "text-[11px] leading-tight",
                  active ? "text-white/60" : "text-white/35"
                )}
              >
                {text.description}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col justify-between bg-emerald-ink px-4 py-5 lg:flex">
      <div className="flex flex-col gap-6">
        <BrandMark />
        <SidebarNav />
      </div>
      <SidebarFarmCard />
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Topbar — mobile menu + desktop context header                       */
/* ------------------------------------------------------------------ */

export function Topbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 border-b border-emerald-ink/10 bg-ivory/90 backdrop-blur">
      {/* Mobile bar */}
      <div className="flex items-center justify-between px-4 py-3 lg:hidden">
        <span className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-ink text-lime">
            <Sprout className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-display text-base font-semibold tracking-tight text-canopy-950">
            AgriSaarthi <span className="text-terracotta-600">360</span>
          </span>
        </span>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={
            menuOpen ? t.chrome.closeMenu : t.chrome.openMenu
          }
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-canopy-200 bg-white text-canopy-800"
        >
          {menuOpen ? (
            <X className="h-5 w-5" aria-hidden />
          ) : (
            <Menu className="h-5 w-5" aria-hidden />
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          id="mobile-nav"
          className="border-t border-canopy-100 bg-white px-4 py-4 lg:hidden"
        >
          <div className="rounded-2xl bg-emerald-ink p-3">
            <SidebarNav onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop contextual header */}
      <div className="hidden items-center justify-between gap-4 px-8 py-3.5 lg:flex">
        <FarmSummaryStatusLine />
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/assistant"
            aria-label={t.chrome.askAssistantAria}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-ink px-4 text-sm font-medium text-white transition-colors hover:bg-canopy-900"
          >
            <Bot className="h-4 w-4 text-lime" aria-hidden />
            {t.chrome.askAgriSaarthi}
          </Link>
          <span className="inline-flex min-h-11 items-center rounded-xl border border-canopy-200 bg-white px-4 text-sm font-medium text-canopy-800">
            {t.chrome.farmWorkspace}
          </span>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile bottom navigation                                            */
/* ------------------------------------------------------------------ */

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  // 4 primary destinations stay thumb-reachable; the rest live in the menu.
  const primary = NAV_ITEMS.filter((item) =>
    ["/dashboard", "/crop-advisor", "/weather", "/assistant"].includes(item.href)
  );
  /** Short, unambiguous mobile labels (full names stay in the menu). */
  const MOBILE_LABELS: Record<string, string> = {
    "/dashboard": t.nav.mobileHome,
    "/crop-advisor": t.nav.mobileCrops,
    "/weather": t.nav.mobileWeather,
    "/assistant": t.nav.mobileAsk,
  };

  return (
    <nav
      aria-label={t.nav.primaryMobile}
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-canopy-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      {primary.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-14 cursor-pointer flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors",
              active ? "text-canopy-800" : "text-loam-500"
            )}
          >
            <Icon
              className={cn("h-5 w-5", active && "text-terracotta-600")}
              aria-hidden
            />
            {MOBILE_LABELS[item.href] ?? item.label}
          </Link>
        );
      })}
    </nav>
  );
}
