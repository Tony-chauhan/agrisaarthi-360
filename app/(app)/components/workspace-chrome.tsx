"use client";

import { useLanguage } from "@/lib/i18n/language-context";

/**
 * Client chrome wrapper for the workspace layout — provides the localized
 * skip link while the layout itself stays a server component.
 */
export function WorkspaceChrome({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  return (
    <>
      <a href="#main-content" className="skip-link">
        {t.chrome.skipToContent}
      </a>
      {children}
    </>
  );
}

/** Localized workspace footer line (client; imported by the server layout). */
export function WorkspaceFooterText() {
  const { t } = useLanguage();
  return <>{t.chrome.workspaceFooter}</>;
}
