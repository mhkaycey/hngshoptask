import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-cream hover:bg-clay disabled:bg-ink/40 shadow-[3px_3px_0_0_var(--color-gold)] hover:shadow-[3px_3px_0_0_var(--color-clay-deep)] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]",
  secondary:
    "border border-ink/20 bg-parchment text-ink hover:bg-sand disabled:text-ink/40",
  ghost: "text-ink-soft hover:bg-parchment hover:text-ink",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center rounded-full px-5 font-mono text-xs font-semibold uppercase tracking-[0.12em] transition-all disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
