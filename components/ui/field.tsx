"use client";

import {
  forwardRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

export interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-canopy-900">
        {label}
        {required ? (
          <span className="ml-0.5 text-terracotta-600" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-loam-600">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const BASE_CONTROL =
  "h-11 w-full rounded-xl border border-canopy-200 bg-white px-3.5 text-base text-loam-900 placeholder:text-loam-400 transition-colors focus:border-canopy-500 focus:outline-none";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...rest }, ref) {
  return <input ref={ref} className={cn(BASE_CONTROL, className)} {...rest} />;
});

const CHEVRON_BG =
  "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23376c4e%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpath d=%22m6 9 6 6 6-6%22/%3E%3C/svg%3E')] bg-[position:right_0.9rem_center] bg-no-repeat";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...rest }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        BASE_CONTROL,
        "cursor-pointer appearance-none pr-10",
        CHEVRON_BG,
        className
      )}
      {...rest}
    >
      {children}
    </select>
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(BASE_CONTROL, "h-auto min-h-24 py-3", className)}
      {...rest}
    />
  );
});
