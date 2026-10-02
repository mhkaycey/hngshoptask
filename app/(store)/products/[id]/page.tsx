import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import { formatCurrency } from "@/lib/format";
import AddToCart from "@/components/store/AddToCart";

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
        </div>
      </div>
    </main>
  );
}
