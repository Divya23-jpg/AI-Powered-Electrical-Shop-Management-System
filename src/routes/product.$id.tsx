import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Heart, Instagram, ShoppingCart, ArrowLeft, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { money } from "@/lib/format";
import { useCart, useWishlist } from "@/lib/store";
import { productsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ context, params }) => {
    const products = await context.queryClient.ensureQueryData(productsQuery);
    const product = products.find((p) => p.id === params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Product not found — Kishore Electronics" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.product;
    return {
      meta: [
        { title: `${p.name} — Kishore Electronics` },
        { name: "description", content: p.description || `Buy ${p.name} at Kishore Electronics.` },
        { property: "og:title", content: `${p.name} — Kishore Electronics` },
        { property: "og:description", content: p.description || "" },
        ...(p.images[0] ? [{ property: "og:image", content: p.images[0] }] : []),
        ...(p.images[0] ? [{ name: "twitter:image", content: p.images[0] }] : []),
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: ProductNotFound,
});

function ProductNotFound() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Product not found</h1>
      <p className="mt-2 text-ink-muted">This product may have been removed.</p>
      <Button asChild className="mt-6">
        <Link to="/products">Back to shop</Link>
      </Button>
    </div>
  );
}

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { data: all } = useSuspenseQuery(productsQuery);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const toggle = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => s.ids.includes(product.id));
  const related = all
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const price = product.discountedPrice || product.price;
  const inStock = product.stock > 0;

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex items-center gap-2 text-sm text-ink-muted">
        <Link to="/" className="hover:text-brand">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-brand">Products</Link>
        <span>/</span>
        <Link to="/products" search={{ category: product.category } as never} className="hover:text-brand">
          {product.category}
        </Link>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl border border-border bg-surface-alt">
            <img
              src={product.images[active] || product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((src: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={cn(
                    "h-16 w-16 overflow-hidden rounded-lg border-2",
                    active === i ? "border-brand" : "border-border",
                  )}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-brand">
            {product.category}
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            {product.name}
          </h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
            <div className="flex items-center gap-0.5 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <span>4.8 · 120 reviews</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold">{money(price)}</span>
            {product.discount > 0 && (
              <>
                <span className="text-lg text-ink-muted line-through">{money(product.price)}</span>
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">
                  {product.discount}% OFF
                </span>
              </>
            )}
          </div>

          <div className={cn("mt-3 inline-flex items-center gap-1.5 text-sm font-medium", inStock ? "text-emerald-600" : "text-red-600")}>
            <Check className="h-4 w-4" />
            {inStock ? `In stock (${product.stock} available)` : "Out of stock"}
          </div>

          <p className="mt-6 text-sm leading-relaxed text-ink-muted">
            {product.description || "Quality electrical product from Kishore Electronics."}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-md border border-border">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-11 w-11 text-lg hover:bg-muted"
              >−</button>
              <div className="w-10 text-center font-semibold">{qty}</div>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="h-11 w-11 text-lg hover:bg-muted"
              >+</button>
            </div>
            <Button
              size="lg"
              onClick={() => add(product, qty)}
              disabled={!inStock}
              className="h-11 gap-2"
            >
              <ShoppingCart className="h-4 w-4" /> Add to cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => toggle(product.id)}
              className="h-11 gap-2"
            >
              <Heart className={cn("h-4 w-4", wished && "fill-brand text-brand")} />
              {wished ? "Wishlisted" : "Wishlist"}
            </Button>
            {product.instagramLink && (
              <a
                href={product.instagramLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
              >
                <Instagram className="h-4 w-4" /> View on Instagram
              </a>
            )}
          </div>

          <div className="mt-8 rounded-xl border border-border bg-surface-alt p-4 text-xs text-ink-muted">
            <div className="font-semibold text-ink">Why buy from Kishore Electronics?</div>
            <ul className="mt-2 space-y-1">
              <li>• Quality-checked, genuine products</li>
              <li>• Fast dispatch across India</li>
              <li>• WhatsApp support for every order</li>
            </ul>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-bold">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-10">
        <Button asChild variant="ghost">
          <Link to="/products"><ArrowLeft className="mr-1 h-4 w-4" />Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}