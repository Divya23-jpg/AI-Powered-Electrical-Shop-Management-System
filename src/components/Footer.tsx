import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import { STORE, CATEGORIES, CONTACT } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-brand/20 bg-black">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-lg border border-brand/60 bg-gradient-to-br from-brand/20 to-transparent font-display text-sm font-bold text-brand">
              KE
            </div>
            <div>
              <div className="font-display text-lg font-bold leading-none">{STORE.name}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-brand/80">Lighting & Electricals</div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            Premium lighting, switches, wires, fans and electrical accessories.
            Trusted quality at fair prices — serving Indore since day one.
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
              <Phone className="h-4 w-4 text-brand" />
              <a href={`tel:+91${CONTACT.phone}`} className="hover:text-brand">{CONTACT.phoneDisplay}</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand" /> {STORE.supportEmail}
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span>{CONTACT.addressLines.join(", ")}</span>
            </li>
            <li className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-brand" />
              <a href={CONTACT.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-brand">@{CONTACT.instagramHandle}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand/20">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-4 text-xs text-ink-muted sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} {STORE.name}. All rights reserved.</span>
          <span>Checkout via WhatsApp · Payment gateway coming soon</span>
        </div>
      </div>
    </footer>
  );
}