import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { GoogleAuthButton, SignOutButton } from "@/components/GoogleAuthButton";
import CartBadge from "@/components/cart/CartBadge";

export default async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold tracking-tight">
            hng<span className="italic text-clay">shop</span>
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft sm:inline">
            est. 2025
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/products"
            className="link-underline hidden text-sm font-medium text-ink-soft hover:text-ink sm:inline"
          >
            Shop
          </Link>

          <Link
            href="/about"
            className="link-underline hidden text-sm font-medium text-ink-soft hover:text-ink lg:inline"
          >
            About
          </Link>

          <Link
            href="/support"
            className="link-underline hidden text-sm font-medium text-ink-soft hover:text-ink lg:inline"
          >
            Support
          </Link>

          {user && (
            <Link
              href="/wishlist"
              className="link-underline text-sm font-medium text-ink-soft hover:text-ink"
              title="Wishlist"
            >
              ♡
            </Link>
          )}

          <CartBadge />

          {user && (
            <Link
              href="/account"
              className="link-underline text-sm font-medium text-ink-soft hover:text-ink"
            >
              Account
            </Link>
          )}

          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="link-underline text-sm font-medium text-ink-soft hover:text-ink"
            >
              Admin
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              {user.image && (
                <Image
                  src={user.image}
                  alt={user.name ?? "avatar"}
                  width={32}
                  height={32}
                  className="rounded-full ring-2 ring-clay/40 ring-offset-2 ring-offset-cream"
                />
              )}
              <span className="hidden text-sm font-medium md:inline">
                {user.name}
              </span>
              <SignOutButton />
            </div>
          ) : (
            <GoogleAuthButton />
          )}
        </nav>
      </div>
    </header>
  );
}
