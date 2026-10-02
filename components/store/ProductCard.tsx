import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  category: string;
  image_url: string | null;
};

export default function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stock <= 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-parchment transition-all duration-300 hover:-translate-y-1 hover:border-ink/25 hover:shadow-[6px_6px_0_0_var(--color-sand)]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-sand/50">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-5xl italic text-ink/15">
            {product.name.charAt(0)}
          </div>
        )}
        {outOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-cream">
            Out of stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-clay">
          {product.category}
        </span>
        <h3 className="font-display text-lg font-semibold leading-snug text-ink">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-sm leading-6 text-ink-soft">
          {product.description}
        </p>
        <span className="mt-auto pt-3 font-display text-xl font-semibold text-ink">
          {formatCurrency(product.price)}
        </span>
      </div>
    </Link>
  );
}
