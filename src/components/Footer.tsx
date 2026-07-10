import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import { STORE, CATEGORIES } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface-alt">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand text-brand-foreground font-display font-bold">
              K
            </div>
            <div className="font-display text-lg font-bold">{STORE.name}</div>
          </div>
          <p className="mt-3 text-sm text-ink-muted">
            Premium lighting and electricals for every home. Trusted quality at
            fair prices.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Shop</h4>
          <ul className="space-y-2 text-sm text-ink-muted">
            {CATEGORIES.slice(0, 6).map((c) => (
              <li key={c}>
                <Link
                  to="/products"
                  search={{ category: c } as never}
                  className="hover:text-brand"
                >
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Help</h4>
          <ul className="space-y-2 text-sm text-ink-muted">
            <li>
              <Link to="/cart" className="hover:text-brand">Cart</Link>
            </li>
            <li>
              <Link to="/wishlist" className="hover:text-brand">Wishlist</Link>
            </li>
            <li>
              <Link to="/checkout" className="hover:text-brand">Checkout</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Contact</h4>
          <ul className="space-y-2 text-sm text-ink-muted">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> +91 94071 23853
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> {STORE.supportEmail}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {STORE.address}
            </li>
            <li className="flex items-center gap-2">
              <Instagram className="h-4 w-4" /> @kisore_electronics
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-4 text-xs text-ink-muted sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} {STORE.name}. All rights reserved.</span>
          <span>Checkout via WhatsApp · Payment gateway coming soon</span>
        </div>
      </div>
    </footer>
  );
}