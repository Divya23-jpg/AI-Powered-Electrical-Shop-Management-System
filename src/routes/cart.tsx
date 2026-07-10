import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/format";
import { useCart } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Kishore Electronics" },
      { name: "description", content: "Review the items in your cart before checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const total = items.reduce((n, i) => n + i.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-ink-muted" />
        <h1 className="mt-4 font-display text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-ink-muted">Browse our range and add products to your cart.</p>
        <Button asChild className="mt-6"><Link to="/products">Start shopping</Link></Button>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="font-display text-3xl font-bold">Your cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((it) => (
            <div
              key={it.productId}
              className="grid grid-cols-[80px_1fr_auto] items-center gap-4 rounded-xl border border-border bg-card p-4"
            >
              <div className="h-20 w-20 overflow-hidden rounded-lg bg-surface-alt">
                <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0">
                <Link to="/product/$id" params={{ id: it.productId }} className="line-clamp-2 font-semibold hover:text-brand">
                  {it.name}
                </Link>
                <div className="mt-1 text-sm text-ink-muted">{money(it.price)} each</div>
                <div className="mt-2 inline-flex items-center gap-1 rounded-md border border-border">
                  <button
                    onClick={() => setQty(it.productId, it.quantity - 1)}
                    className="grid h-8 w-8 place-items-center hover:bg-muted"
                  ><Minus className="h-3.5 w-3.5" /></button>
                  <div className="w-8 text-center text-sm font-semibold">{it.quantity}</div>
                  <button
                    onClick={() => setQty(it.productId, it.quantity + 1)}
                    className="grid h-8 w-8 place-items-center hover:bg-muted"
                  ><Plus className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-lg font-bold">{money(it.price * it.quantity)}</div>
                <button
                  onClick={() => remove(it.productId)}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-ink-muted hover:text-brand"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <aside className="h-fit rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{money(total)}</span></div>
            <div className="flex justify-between text-ink-muted"><span>Shipping</span><span>Calculated on WhatsApp</span></div>
          </div>
          <div className="mt-4 flex justify-between border-t border-border pt-4 font-display text-lg font-bold">
            <span>Total</span><span>{money(total)}</span>
          </div>
          <Button asChild size="lg" className="mt-6 w-full">
            <Link to="/checkout">Proceed to checkout</Link>
          </Button>
          <Button asChild variant="outline" className="mt-2 w-full">
            <Link to="/products">Continue shopping</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}