import Link from "next/link";

export const metadata = {
  title: "Terms of service — hngshop",
  description: "The terms that govern your use of hngshop.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <nav className="font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
        <Link href="/" className="hover:text-clay">
          ← Back home
        </Link>
      </nav>

      <h1 className="mt-10 font-display text-5xl font-semibold tracking-tight">
        Terms of service
      </h1>
      <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
        Last updated: October 2026
      </p>

      <div className="mt-10 flex flex-col gap-8 text-base leading-8 text-ink-soft">
        <section>
          <h2 className="font-display text-2xl font-semibold text-ink">
            Using the shop
          </h2>
          <p className="mt-2">
            By placing an order or creating an account you agree to these
            terms. You agree to provide accurate information at checkout and
            to use the shop lawfully. We may suspend accounts that abuse the
            service.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-ink">
            Orders &amp; pricing
          </h2>
          <p className="mt-2">
            An order is a request to buy; it becomes binding when we accept it
            and confirm it by email. Prices are shown at checkout and are
            charged in the currency displayed. If we cannot fulfill an order
            (for example, stock runs out), we cancel it and refund any amount
            taken.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-ink">
            Returns
          </h2>
          <p className="mt-2">
            Most items can be returned within 30 days of delivery if unused
            and in original packaging. Contact{" "}
            <Link href="/support" className="text-clay underline underline-offset-4">
              support
            </Link>{" "}
            with your order number to start a return.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-ink">
            Reviews &amp; community content
          </h2>
          <p className="mt-2">
            Reviews must come from actual purchasers and reflect your honest
            experience. We may remove reviews that are abusive, spam, or
            fraudulent. You keep ownership of what you write and grant us a
            license to display it on the shop.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-ink">
            Liability
          </h2>
          <p className="mt-2">
            We work hard to get orders right, but the shop is provided
            &quot;as is&quot; to the extent permitted by law. Our liability
            for any issue with an order is limited to the amount you paid for
            that order.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-ink">
            Changes
          </h2>
          <p className="mt-2">
            We may update these terms from time to time. The version in effect
            is the one published on this page when you place your order.
          </p>
        </section>
      </div>
    </main>
  );
}
