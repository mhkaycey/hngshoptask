import Link from "next/link";

export const metadata = {
  title: "Privacy policy — hngshop",
  description: "How hngshop collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <nav className="font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
        <Link href="/" className="hover:text-clay">
          ← Back home
        </Link>
      </nav>

      <h1 className="mt-10 font-display text-5xl font-semibold tracking-tight">
        Privacy policy
      </h1>
      <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
        Last updated: October 2026
      </p>

      <div className="mt-10 flex flex-col gap-8 text-base leading-8 text-ink-soft">
        <section>
          <h2 className="font-display text-2xl font-semibold text-ink">
            What we collect
          </h2>
          <p className="mt-2">
            When you place an order we collect your name, email address, and
            shipping address — the minimum needed to deliver your order and
            send confirmations. If you sign in with Google, we store your
            Google account id, email, name, and profile picture so we can
            recognize you next time. We also keep records of your orders,
            reviews, and wishlist.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-ink">
            How we use it
          </h2>
          <p className="mt-2">
            We use your data to process orders, send transactional emails
            (confirmations and status updates), provide support, and show you
            your own order history, reviews, and wishlist. We do not sell your
            personal information to anyone.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-ink">
            Sharing
          </h2>
          <p className="mt-2">
            We share only what is necessary to run the shop: our email
            provider (to send you transactional email) and the payment and
            shipping services involved in fulfilling your order. Access to
            customer data inside our team is limited to staff who need it.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-ink">
            Cookies &amp; sessions
          </h2>
          <p className="mt-2">
            We use a strictly necessary session cookie to keep you signed in
            and to remember your cart. We do not run advertising or
            third-party analytics trackers.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-ink">
            Your choices
          </h2>
          <p className="mt-2">
            You can request a copy of your data or ask us to delete your
            account by contacting{" "}
            <Link href="/support" className="text-clay underline underline-offset-4">
              support
            </Link>
            . Order records may be retained where required by law.
          </p>
        </section>
      </div>
    </main>
  );
}
