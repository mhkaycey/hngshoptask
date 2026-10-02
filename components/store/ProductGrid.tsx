import ProductCard, { type Product } from "@/components/store/ProductCard";

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-ink/25 bg-parchment/50 py-20 text-center">
        <span className="font-display text-3xl italic text-clay">✳</span>
        <p className="font-display text-lg font-semibold">No products found</p>
        <p className="text-sm text-ink-soft">
          Try a different search term or category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
