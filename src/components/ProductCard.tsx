import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/format";
import { useCart, useWishlist } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { CONTACT } from "@/lib/config";

const tagStyles: Record<string, string> = {
  HOT: "bg-brand text-brand-foreground",
  NEW: "bg-foreground text-background",
  SALE: "bg-brand text-brand-foreground",
};

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const toggle = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => s.ids.includes(product.id));
  const img =
    product.images[0] ||
    "https://images.unsplash.com/photo-1558002038-1055907df827?w=800";
  const discount = product.discount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-brand/60 hover:shadow-[var(--shadow-lift)]"
    >
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="relative block aspect-square overflow-hidden bg-black"
      >
        <img
          src={img}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover opacity-95 transition-transform duration-500 group-hover:scale-105"
        />
        {product.tag && tagStyles[product.tag] && (
          <span
            className={cn(
              "absolute left-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
              tagStyles[product.tag],
            )}
          >
            {product.tag}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full border border-brand/40 bg-background/90 px-2 py-0.5 text-[10px] font-bold text-brand shadow-sm">
            -{discount}%
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggle(product.id);
          }}
          aria-label="Toggle wishlist"
          className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full border border-border bg-background/90 shadow-sm transition-colors hover:border-brand hover:bg-brand hover:text-brand-foreground"
        >
          <Heart
            className={cn("h-4 w-4", wished && "fill-brand text-brand")}
          />
        </button>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand/80">
          {product.category || "Electricals"}
        </div>
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="line-clamp-2 text-sm font-semibold leading-snug hover:text-brand"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-bold text-foreground">
              {money(product.discountedPrice || product.price)}
            </span>
            {discount > 0 && (
              <span className="text-xs text-ink-muted line-through">
                {money(product.price)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <a
              href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(`Hi, I'd like to enquire about ${product.name}`)}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label="Enquire on WhatsApp"
              className="grid h-9 w-9 place-items-center rounded-md border border-border text-foreground transition-colors hover:border-brand hover:bg-brand hover:text-brand-foreground"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
            <Button
              size="sm"
              onClick={() => add(product)}
              className="h-9 gap-1 px-3"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}