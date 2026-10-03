import Link from "next/link";

export const metadata = {
  title: "FAQ — hngshop",
  description: "Frequently asked questions about orders, shipping, returns, and reviews.",
};

const faqs = [
  {
    q: "How long does shipping take?",
    a: "Orders are processed within 1–2 business days. Depending on your location, delivery typically takes 3–7 business days after that. You'll get an email when your order ships.",
  },
  {
    q: "Can I track my order?",
    a: "Yes. Every order gets an order number in its confirmation email, and signed-in customers can see the live status of every order on the Account page.",
  },
  {
    q: "What is your return policy?",
    a: "You can return most items within 30 days of delivery as long as they're unused and in original packaging. Contact support with your order number and we'll walk you through it.",
  },
  {
    q: "Do I need an account to order?",
    a: "No — guest checkout is fully supported. Just enter your email and shipping address at checkout. An account does unlock order history and a wishlist, though.",
  },
  {
    q: "How do payments work?",
    a: "Payments are handled securely at checkout. If a payment issue ever arises, contact support with your order number and we'll sort it out.",
  },
  {
    q: "Who can write product reviews?",
    a: "Anyone can read reviews on a product page. To write one, you need to be signed in and to have actually purchased that product from us — this keeps reviews trustworthy.",
  },
  {
    q: "What is the wishlist?",
    a: "The wishlist lets signed-in customers save products for later. Tap the ♡ Save button on any product, then find everything under Wishlist in your account menu.",
  },
  {
    q: "An item is out of stock — will it come back?",
    a: "Usually yes. Wishlist the item and check back; restocked items keep the same product page.",
  },
  {
    q: "How do I contact support?",
    a: "Use the contact form on our Support page. We reply to your email, usually within one business day.",
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <nav className="font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
        <Link href="/" className="hover:text-clay">
          ← Back home
        </Link>
      </nav>

      <span className="mt-10 block font-mono text-xs uppercase tracking-[0.3em] text-clay">
        Quick answers
      </span>
      <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight">
        FAQ
      </h1>
      <p className="mt-4 text-sm leading-7 text-ink-soft">
        The questions we hear most. Can&apos;t find yours?{" "}
        <Link href="/support" className="text-clay underline underline-offset-4">
          Contact support
        </Link>
        .
      </p>

      <div className="mt-10 flex flex-col gap-4">
        {faqs.map((faq) => (
          <details
            key={faq.q}
            className="group rounded-2xl border border-ink/10 bg-parchment p-6 open:border-ink/25"
          >
            <summary className="cursor-pointer list-none font-display text-lg font-semibold marker:hidden">
              <span className="mr-2 font-mono text-xs text-clay group-open:hidden">+</span>
              <span className="mr-2 hidden font-mono text-xs text-clay group-open:inline">−</span>
              {faq.q}
            </summary>
            <p className="mt-3 text-sm leading-7 text-ink-soft">{faq.a}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
