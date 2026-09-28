import { Sidebar, Topbar, MobileNav } from "@/components/layout/app-shell";
import { FloatingAiRobot } from "@/components/assistant/floating-ai-robot";

/**
 * Workspace shell layout — applies ONLY to the internal product routes.
 * Deep-emerald navigation + warm-ivory content surface; the public
 * landing page renders its own experience in the root group.
 */
export default function AppWorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Sidebar />
      <div className="flex min-h-screen flex-col bg-ivory lg:pl-72">
        <Topbar />
        <main
          id="main-content"
          className="mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-12"
        >
          {children}
        </main>
        <footer className="border-t border-canopy-100 px-4 py-4 text-center text-xs text-loam-500 lg:px-8">
          AgriSaarthi 360 — Smart Agriculture Platform. Decision support, not a
          replacement for qualified agricultural experts.
        </footer>
      </div>
      <MobileNav />
      <FloatingAiRobot />
    </>
  );
}
