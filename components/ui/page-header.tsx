import type { ReactNode } from "react";

/**
 * PageHeader — consistent page intro: eyebrow context, display title,
 * supporting description, and optional right-side actions.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-[0.14em] text-terracotta-600">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-canopy-900 sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-loam-600 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 gap-3">{actions}</div> : null}
    </header>
  );
}

/** SectionHeading — rhythm inside pages without repeating markup. */
export function SectionHeading({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <h2 className="font-display text-lg font-semibold tracking-tight text-canopy-900">
        {children}
      </h2>
      {hint ? <p className="text-xs text-loam-500">{hint}</p> : null}
    </div>
  );
}
