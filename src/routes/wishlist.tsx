import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { productsQuery } from "@/lib/queries";
import { useWishlist } from "@/lib/store";

export const Route = createFileRoute("/wishlist")({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  head: () => ({
    meta: [
      { title: "Wishlist — Kishor Electronics" },
      { name: "description", content: "Your saved products." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { data: all } = useSuspenseQuery(productsQuery);
  const ids = useWishlist((s) => s.ids);
  const items = all.filter((p) => ids.includes(p.id));

  if (items.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <Heart className="mx-auto h-12 w-12 text-ink-muted" />
        <h1 className="mt-4 font-display text-3xl font-bold">Your wishlist is empty</h1>
        <p className="mt-2 text-ink-muted">Tap the heart on any product to save it here.</p>
        <Button asChild className="mt-6"><Link to="/products">Explore products</Link></Button>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="font-display text-3xl font-bold">Your wishlist</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}