import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWishlistProducts } from "@/lib/wishlist";
import { formatCurrency } from "@/lib/format";
import WishlistButton from "@/components/store/WishlistButton";
import AddToCart from "@/components/store/AddToCart";

export const metadata = { title: "Wishlist — hngshop" };

export default async function WishlistPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    // Wishlist is per-account; send guests to the storefront.
    redirect("/products");
  }

  const items = await getWishlistProducts(userId);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <nav className="font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
        <Link href="/" className="hover:text-clay">
          ← Back home
        </Link>
      </nav>

      <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight">
        Wishlist
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Products you&apos;ve saved for later.
      </p>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-ink/15 bg-parchment/60 p-10 text-center">
          <p className="font-display text-2xl italic text-ink-soft">
            Nothing saved yet.
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Browse the shop and tap ♡ Save on anything you like.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex h-10 items-center rounded-full bg-ink px-6 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-clay"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-10 flex flex-col gap-6">
          {items.map((product) => (
            <li
              key={product.id}
              className="flex flex-col gap-6 rounded-2xl border border-ink/10 bg-parchment p-6 sm:flex-row sm:items-center"
            >
              <Link
                href={`/products/${product.id}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-ink/10 bg-sand/50"
              >
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center font-display text-3xl italic text-ink/20">
                    {product.name.charAt(0)}
                  </span>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-clay">
                  {product.category}
                </span>
                <Link
                  href={`/products/${product.id}`}
                  className="mt-1 block font-display text-xl font-semibold hover:text-clay"
                >
                  {product.name}
                </Link>
                <p className="mt-1 font-display text-lg text-clay">
                  {formatCurrency(product.price)}
                </p>
                {product.stock <= 0 && (
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-clay-deep">
                    Out of stock
                  </p>
                )}
                <div className="mt-3 max-w-xs">
                  <AddToCart
                    productId={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.image_url}
                    stock={product.stock}
                  />
                </div>
              </div>

              <div className="shrink-0 self-start sm:self-center">
                <WishlistButton
                  productId={product.id}
                  initiallySaved={true}
                  signedIn={true}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
