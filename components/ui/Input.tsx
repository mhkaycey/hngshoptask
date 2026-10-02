import type { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-10 w-full rounded-xl border border-ink/15 bg-parchment/60 px-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-clay focus:bg-parchment ${className}`}
      {...props}
    />
  );
}
