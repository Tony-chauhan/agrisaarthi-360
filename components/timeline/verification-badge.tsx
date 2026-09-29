"use client";

import { ShieldCheck, ShieldAlert, LoaderCircle, ShieldQuestion } from "lucide-react";
import type { VerificationStatus } from "@/lib/timeline/types";
import { useLanguage } from "@/lib/i18n/language-context";

/**
 * VerificationBadge — mutually exclusive, icon+text (never color-only).
 * BLOCKCHAIN VERIFIED / LOCAL VERIFICATION / BLOCKCHAIN PENDING /
 * BLOCKCHAIN UNAVAILABLE / unverified (no badge rendered).
 * "Blockchain verified" is rendered only when the app actually set that
 * status from a real on-chain confirmation — never by default.
 */
export function VerificationBadge({
  status,
}: {
  status: VerificationStatus;
}) {
  const { t } = useLanguage();
  if (status === "unverified") return null;

  if (status === "blockchain-verified") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-sprout-400/40 bg-sprout-400/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-canopy-700">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
        {t.verification.blockchainVerified}
      </span>
    );
  }

  if (status === "local-verified") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-canopy-200 bg-canopy-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-canopy-700">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
        {t.verification.localVerified}
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-harvest-500/40 bg-harvest-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-harvest-600">
        <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden />
        {t.verification.pending}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-red-700">
      <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
      {t.verification.unavailable}
    </span>
  );
}

/** Re-exported for potential status legends. */
export { ShieldQuestion };
