import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import { formatCurrency } from "@/lib/format";
import { auth } from "@/lib/auth";
import AddToCart from "@/components/store/AddToCart";
import WishlistButton from "@/components/store/WishlistButton";
import ReviewForm from "@/components/store/ReviewForm";
import StarRating from "@/components/store/StarRating";
import {
  getReviews,
  getReviewStats,
  getUserReview,
  hasPurchasedProduct,
} from "@/lib/reviews";
import { isWishlisted } from "@/lib/wishlist";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const product = await getProduct(id);
  return { title: product ? `${product.name} — hngshop` : "Not found" };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 5;

  const [reviews, stats, session] = await Promise.all([
    getReviews(product.id),
    getReviewStats(product.id),
    auth(),
  ]);
  const userId = session?.user?.id;
  const [userReview, purchased, wishlisted] = userId
    ? await Promise.all([
        getUserReview(userId, product.id),
        hasPurchasedProduct(userId, product.id),
        isWishlisted(userId, product.id),
      ])
    : [null, false, false];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <nav className="font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
        <Link href="/products" className="hover:text-clay">
          ← Back to products
        </Link>
      </nav>

      <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-ink/10 bg-sand/50 shadow-[8px_8px_0_0_var(--color-parchment)]">
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className="object-cover"
            />
          )}
        </div>

        <div className="flex flex-col">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-clay">
            {product.category}
          </span>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight">
            {product.name}
          </h1>
          <p className="mt-4 font-display text-3xl font-semibold text-clay">
            {formatCurrency(product.price)}
          </p>

          <p className="mt-3 font-mono text-xs uppercase tracking-[0.12em]">
            {outOfStock ? (
              <span className="text-clay-deep">Out of stock</span>
            ) : lowStock ? (
              <span className="text-gold">
                Low stock — only {product.stock} left
              </span>
            ) : (
              <span className="text-moss">In stock ({product.stock} available)</span>
            )}
          </p>

          <p className="mt-6 border-l-2 border-gold pl-4 leading-7 text-ink-soft">
            {product.description}
          </p>

          <div className="mt-8">
            <AddToCart
              productId={product.id}
              name={product.name}
              price={product.price}
              image={product.image_url}
              stock={product.stock}
            />
          </div>

          <div className="mt-4">
            <WishlistButton
              productId={product.id}
              initiallySaved={wishlisted}
              signedIn={Boolean(userId)}
            />
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16 border-t border-ink/10 pt-12" id="reviews">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Customer reviews
          </h2>
          {stats.count > 0 ? (
            <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-soft">
              <StarRating value={stats.average} /> {stats.average.toFixed(1)} ·{" "}
              {stats.count} review{stats.count === 1 ? "" : "s"}
            </p>
          ) : (
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft">
              No reviews yet
            </p>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Review list */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {reviews.length === 0 && (
              <p className="rounded-2xl border border-dashed border-ink/15 bg-parchment/60 p-6 text-sm leading-6 text-ink-soft">
                Nobody has reviewed this product yet. If you&apos;ve bought it,
                your review helps other shoppers.
              </p>
            )}
            {reviews.map((review) => (
              <article
                key={review.user_id}
                className="rounded-2xl border border-ink/10 bg-parchment p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <StarRating value={review.rating} />
                    <span className="text-sm font-semibold text-ink">
                      {review.reviewer_name ?? "Customer"}
                    </span>
                  </div>
                  <time
                    dateTime={review.created_at}
                    className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft"
                  >
                    {new Date(review.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>
                {review.comment && (
                  <p className="mt-3 text-sm leading-6 text-ink-soft">
                    {review.comment}
                  </p>
                )}
              </article>
            ))}
          </div>

          {/* Review form / eligibility */}
          <aside className="h-fit rounded-2xl border border-ink/10 bg-parchment p-6">
            <h3 className="font-display text-xl font-semibold">
              {userReview ? "Your review" : "Write a review"}
            </h3>
            {userId && purchased ? (
              <>
                <p className="mt-2 text-xs leading-5 text-ink-soft">
                  Verified purchase — thanks for shopping with us.
                </p>
                <div className="mt-4">
                  <ReviewForm
                    productId={product.id}
                    initialRating={userReview?.rating}
                    initialComment={userReview?.comment}
                  />
                </div>
              </>
            ) : !userId ? (
              <p className="mt-2 text-sm leading-6 text-ink-soft">
                Sign in with Google from the navbar to review a product
                you&apos;ve purchased.
                Everyone can read reviews.
              </p>
            ) : (
              <p className="mt-2 text-sm leading-6 text-ink-soft">
                Only customers who have purchased this product can write a
                review. Order it first, then come back and share your thoughts.
              </p>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
