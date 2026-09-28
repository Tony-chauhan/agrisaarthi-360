import { cn } from "@/lib/cn";

/**
 * REVEAL — scroll-activated entrance (opacity + translate only).
 * Activated by RevealObserver; CSS forces visibility under
 * prefers-reduced-motion. Render-safe on the server.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  /** Stagger siblings: transition-delay in ms. */
  delay?: number;
}) {
  return (
    <div
      className={cn("reveal", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
