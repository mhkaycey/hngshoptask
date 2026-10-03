import Link from "next/link";
import ContactForm from "@/components/store/ContactForm";

export const metadata = {
  title: "Support — hngshop",
  description: "Contact the hngshop support team.",
};

export default function SupportPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
      <nav className="font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
        <Link href="/" className="hover:text-clay">
          ← Back home
        </Link>
      </nav>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <span className="block font-mono text-xs uppercase tracking-[0.3em] text-clay">
            We&apos;re here to help
          </span>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
            Support
          </h1>
          <p className="mt-4 text-sm leading-7 text-ink-soft">
            Order questions, returns, product advice — whatever it is, send us
            a message and we&apos;ll reply to your email, usually within one
            business day.
          </p>

          <div className="mt-8 flex flex-col gap-4 text-sm">
            <div className="rounded-2xl border border-ink/10 bg-parchment p-5">
              <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
                Response time
              </h2>
              <p className="mt-1 text-ink">
                Mon–Fri, within 24 hours. Weekends take a little longer.
              </p>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-parchment p-5">
              <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
                Quick answers
              </h2>
              <p className="mt-1 text-ink">
                Many questions are already answered on our{" "}
                <Link href="/faq" className="text-clay underline underline-offset-4">
                  FAQ page
                </Link>
                .
              </p>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-parchment p-5">
              <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
                Order status
              </h2>
              <p className="mt-1 text-ink">
                Signed in? See every order under{" "}
                <Link href="/account" className="text-clay underline underline-offset-4">
                  Account
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-parchment p-8 lg:col-span-3">
          <h2 className="font-display text-2xl font-semibold">
            Send us a message
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            We&apos;ll reply to the email address you provide.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  );
}
