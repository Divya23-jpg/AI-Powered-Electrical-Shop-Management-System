import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Heart, Instagram, Menu, MessageCircle, Phone, Search, ShoppingCart, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STORE, CATEGORIES, CONTACT } from "@/lib/config";
import { useCart, useWishlist } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const cartCount = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const wishlistCount = useWishlist((s) => s.ids.length);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/products", search: { q: q || undefined } as never });
    setMobileOpen(false);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl transition-all",
        scrolled && "shadow-[0_8px_28px_-16px_rgba(0,0,0,0.8)]",
      )}
    >
      <div className="border-b border-border/40 bg-black text-brand">
        <div className="container-page flex h-9 items-center justify-between text-[11px] tracking-wide">
          <span className="text-ink-muted">Free shipping on orders over ₹999 · WhatsApp checkout</span>
          <div className="hidden items-center gap-4 sm:flex">
            <a href={`tel:+91${CONTACT.phone}`} className="inline-flex items-center gap-1.5 hover:text-brand-foreground transition-colors">
              <Phone className="h-3 w-3" /> {CONTACT.phoneDisplay}
            </a>
            <a href={CONTACT.instagramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-brand-foreground transition-colors">
              <Instagram className="h-3 w-3" /> @{CONTACT.instagramHandle}
            </a>
          </div>
        </div>
      </div>
      <div className="container-page flex h-16 items-center gap-4">
        <button
          className="md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="grid h-10 w-10 place-items-center rounded-lg border border-brand/60 bg-gradient-to-br from-brand/20 to-transparent font-display text-sm font-bold tracking-tight text-brand">
            KE
          </div>
          <div className="hidden sm:block">
            <div className="font-display text-lg font-bold leading-none tracking-tight">
              {STORE.name}
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-brand/80">
              Lighting & Electricals
            </div>
          </div>
        </Link>
        <form onSubmit={submit} className="ml-2 hidden flex-1 md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search LED bulbs, fans, extension boards…"
              className="h-10 rounded-full border-border/60 bg-surface-alt pl-10"
            />
          </div>
        </form>
        <nav className="ml-auto flex items-center gap-1">
          <a
            href={CONTACT.instagramUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="hidden h-10 w-10 items-center justify-center rounded-md hover:bg-muted sm:inline-flex"
          >
            <Instagram className="h-5 w-5" />
          </a>
          <Link
            to="/wishlist"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-semibold text-brand-foreground">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-semibold text-brand-foreground">
                {cartCount}
              </span>
            )}
          </Link>
          <Button asChild size="sm" className="ml-2 hidden gap-1.5 md:inline-flex">
            <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </Button>
        </nav>
      </div>
      <div className="hidden border-t border-border bg-surface-alt md:block">
        <div className="container-page flex h-11 items-center gap-6 overflow-x-auto text-sm">
          <Link
            to="/products"
            className={cn(
              "shrink-0 font-medium transition-colors hover:text-brand",
              pathname === "/products" && "text-brand",
            )}
          >
            All Products
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              to="/products"
              search={{ category: c } as never}
              className="shrink-0 text-ink-muted transition-colors hover:text-brand"
            >
              {c}
            </Link>
          ))}
        </div>
      </div>
      {mobileOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container-page py-3">
            <form onSubmit={submit}>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search products"
                  className="h-10 pl-10"
                />
              </div>
            </form>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <Link
                to="/products"
                onClick={() => setMobileOpen(false)}
                className="rounded-md border border-border px-3 py-2"
              >
                All Products
              </Link>
              {CATEGORIES.map((c) => (
                <Link
                  key={c}
                  to="/products"
                  search={{ category: c } as never}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md border border-border px-3 py-2"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}