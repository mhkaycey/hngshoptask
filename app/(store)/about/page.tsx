import Link from "next/link";

export const metadata = {
  title: "About us — hngshop",
  description:
    "Who we are, what we sell, and the promises we make to every hngshop customer.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <nav className="font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
        <Link href="/" className="hover:text-clay">
          ← Back home
        </Link>
      </nav>

      <span className="mt-10 block font-mono text-xs uppercase tracking-[0.3em] text-clay">
        Our story
      </span>
      <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight">
        About hngshop
      </h1>

      <div className="mt-8 flex flex-col gap-6 text-base leading-8 text-ink-soft">
        <p>
          hngshop started in 2025 with a simple idea: an online store that
          treats people the way a good neighborhood shop does — honest
          products, fair prices, and no surprises at checkout.
        </p>
        <p>
          We curate a small catalog on purpose. Every product we list is one
          we&apos;ve used, liked, and can stand behind. If something goes wrong
          with an order, a real person on our team replies to your email — no
          ticket mazes, no bots.
        </p>
        <p>
          Behind the storefront is a small distributed team of makers,
          packers, and support staff. We&apos;re grateful you&apos;re here.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          {
            title: "Honest goods",
            body: "Nothing we wouldn't use ourselves. Every listing is accurate, down to the last detail.",
          },
          {
            title: "Fair prices",
            body: "We price to cover quality and treat our people well — no fake discounts, no games.",
          },
          {
            title: "Real support",
            body: "Questions, returns, or just browsing? Our support team answers every message.",
          },
        ].map((value) => (
          <div
            key={value.title}
            className="rounded-2xl border border-ink/10 bg-parchment p-6"
          >
            <h2 className="font-display text-xl font-semibold">
              {value.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{value.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link
          href="/products"
          className="inline-flex h-10 items-center rounded-full bg-ink px-6 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-clay"
        >
          Browse the shop
        </Link>
        <Link
          href="/support"
          className="inline-flex h-10 items-center rounded-full border border-ink/20 bg-parchment px-6 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-sand"
        >
          Contact us
        </Link>
      </div>
    </main>
  );
}
