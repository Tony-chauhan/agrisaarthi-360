"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Modal — dialog pattern with Escape handling, backdrop click,
 * focus capture on open, and accessible labelling.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-canopy-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          "w-full max-w-lg rounded-t-2xl bg-white shadow-deep outline-none sm:rounded-2xl",
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-canopy-100 px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-canopy-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-loam-500 transition-colors hover:bg-canopy-50 hover:text-canopy-800"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer ? (
          <div className="flex justify-end gap-3 border-t border-canopy-100 px-5 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
