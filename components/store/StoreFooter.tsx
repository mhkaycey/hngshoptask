import Link from "next/link";

export default function StoreFooter() {
  return (
    <footer className="mt-auto border-t border-ink/10 bg-parchment">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-12 sm:grid-cols-3">
        <div>
          <span className="font-display text-2xl font-semibold tracking-tight">
            hng<span className="italic text-clay">shop</span>
          </span>
          <p className="mt-3 max-w-xs text-sm leading-6 text-ink-soft">
            A small shop with honest goods, fair prices, and real people behind
            every order.
          </p>
        </div>

        <nav aria-label="Company">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
            Company
          </h3>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            <li>
              <Link href="/about" className="link-underline text-ink-soft hover:text-ink">
                About us
              </Link>
            </li>
            <li>
              <Link href="/faq" className="link-underline text-ink-soft hover:text-ink">
                FAQ
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Support">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
            Support
          </h3>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            <li>
              <Link href="/support" className="link-underline text-ink-soft hover:text-ink">
                Contact support
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="link-underline text-ink-soft hover:text-ink">
                Wishlist
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="link-underline text-ink-soft hover:text-ink">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="link-underline text-ink-soft hover:text-ink">
                Terms of service
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-ink/10 py-4">
        <p className="mx-auto w-full max-w-7xl px-6 font-mono text-[11px] uppercase tracking-[0.15em] text-ink-soft">
          © {new Date().getFullYear()} hngshop — All rights reserved
        </p>
      </div>
    </footer>
  );
}
