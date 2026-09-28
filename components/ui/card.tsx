import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Card({ className, interactive, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "card-surface",
        interactive &&
          "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift"
      )}
      {...rest}
    />
  );
}

export function CardHeader({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 border-b border-canopy-100/70 px-5 py-4",
        className
      )}
      {...rest}
    />
  );
}

export function CardTitle({
  className,
  ...rest
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-display text-lg font-semibold tracking-tight text-canopy-900",
        className
      )}
      {...rest}
    />
  );
}

export function CardDescription({
  className,
  ...rest
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-loam-600", className)} {...rest} />;
}

export function CardContent({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)} {...rest} />;
}

export function CardFooter({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-t border-canopy-100/70 px-5 py-3",
        className
      )}
      {...rest}
    />
  );
}
