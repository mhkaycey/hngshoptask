import Link from "next/link";
import { getFeaturedProducts } from "@/lib/products";
import ProductGrid from "@/components/store/ProductGrid";

export const metadata = { title: "Home" };

const tickerItems = [
  "Free shipping over $75",
  "Curated goods",
  "New drops weekly",
  "Shipped fast",
  "Priced fair",
];

export default async function HomePage() {
  const products = await getFeaturedProducts(8);

  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink/10">
        {/* decorative shapes */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gold/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-clay/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-[12%] top-24 hidden h-24 w-24 rotate-12 border-2 border-clay/40 lg:block"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-16 left-[8%] hidden h-16 w-16 rounded-full border-2 border-moss/40 lg:block"
        />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 py-28 text-center sm:py-36">
          <p className="animate-rise font-mono text-xs uppercase tracking-[0.35em] text-clay">
            A curated general store
          </p>
          <h1 className="animate-rise max-w-4xl font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
            Quality gear for the{" "}
            <span className="relative inline-block italic text-clay">
              everyday
              <svg
                aria-hidden
                viewBox="0 0 220 12"
                preserveAspectRatio="none"
                className="absolute -bottom-2 left-0 h-3 w-full text-gold"
              >
                <path
                  d="M3 9C60 3 160 3 217 8"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>{" "}
            life
          </h1>
          <p className="animate-rise max-w-xl text-lg leading-relaxed text-ink-soft">
            Curated electronics, home goods, and outdoor essentials — shipped
            fast, priced fair.
          </p>
          <div className="animate-rise flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-8 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-cream shadow-[4px_4px_0_0_var(--color-gold)] transition-all hover:bg-clay hover:shadow-[4px_4px_0_0_var(--color-clay-deep)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            >
              Shop all products
            </Link>
            <a
              href="#featured"
              className="link-underline font-mono text-xs uppercase tracking-[0.15em] text-ink-soft hover:text-ink"
            >
              See what&apos;s featured
            </a>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <section
        aria-hidden
        className="overflow-hidden border-b border-ink/10 bg-ink py-3"
      >
        <div className="flex w-max animate-marquee gap-12">
          {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map(
            (item, i) => (
              <span
                key={i}
                className="flex items-center gap-12 whitespace-nowrap font-mono text-xs uppercase tracking-[0.25em] text-cream/80"
              >
                {item}
                <span className="text-gold">✳</span>
              </span>
            )
          )}
        </div>
      </section>

      {/* Featured */}
      <section id="featured" className="mx-auto w-full max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-clay">
              Handpicked
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Featured products
            </h2>
          </div>
          <Link
            href="/products"
            className="link-underline shrink-0 font-mono text-xs uppercase tracking-[0.15em] text-ink-soft hover:text-ink"
          >
            View all →
          </Link>
        </div>
        <ProductGrid products={products} />
      </section>

      {/* Value band */}
      <section className="border-t border-ink/10 bg-parchment">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 sm:grid-cols-3">
          {[
            {
              title: "Chosen with care",
              body: "Every item is vetted for build quality and usefulness before it makes the shelf.",
            },
            {
              title: "Fair, honest prices",
              body: "No gimmicks, no fake markdowns. Just sensible pricing on goods that last.",
            },
            {
              title: "Fast, careful shipping",
              body: "Orders leave the workshop quickly, packed to arrive the way they left.",
            },
          ].map((item) => (
            <div key={item.title} className="max-w-xs">
              <span className="font-display text-2xl italic text-clay">✳</span>
              <h3 className="mt-3 font-display text-xl font-semibold">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
