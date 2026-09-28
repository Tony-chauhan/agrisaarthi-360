import type { ReactNode } from "react";
import { Sprout } from "lucide-react";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/* Loading states                                                      */
/* ------------------------------------------------------------------ */

export function LoadingSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-3 py-8 text-sm text-loam-600"
    >
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-canopy-200 border-t-canopy-700"
        aria-hidden
      />
      {label}…
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "card-surface animate-pulse px-5 py-4",
        className
      )}
    >
      <div className="h-4 w-1/3 rounded bg-canopy-100" />
      <div className="mt-3 h-3 w-2/3 rounded bg-loam-100" />
      <div className="mt-2 h-3 w-1/2 rounded bg-loam-100" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Empty / Error states                                                */
/* ------------------------------------------------------------------ */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-canopy-200 bg-white/60 px-6 py-12 text-center">
      {icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-canopy-50 text-canopy-600">
          {icon}
        </div>
      ) : null}
      <div>
        <p className="font-display text-lg font-semibold text-canopy-900">
          {title}
        </p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-loam-600">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50/60 px-6 py-10 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
        <Sprout className="h-6 w-6" aria-hidden />
      </div>
      <div>
        <p className="font-display text-lg font-semibold text-red-800">{title}</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-red-700">{description}</p>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="cursor-pointer rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
