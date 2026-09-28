"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "ghost"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-canopy-800 text-white hover:bg-canopy-900 shadow-sm hover:shadow-md",
  secondary:
    "bg-white text-canopy-800 border border-canopy-200 hover:border-canopy-300 hover:bg-canopy-50",
  accent:
    "bg-terracotta-600 text-white hover:bg-terracotta-700 shadow-sm hover:shadow-md",
  ghost: "text-canopy-700 hover:bg-canopy-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      type = "button",
      ...rest
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          "inline-flex cursor-pointer items-center justify-center rounded-xl font-medium transition-colors duration-200",
          "disabled:cursor-not-allowed disabled:opacity-50",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className
        )}
        {...rest}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {!loading && leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);
