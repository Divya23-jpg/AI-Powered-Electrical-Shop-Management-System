import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Headphones,
  Instagram,
  ShieldCheck,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, CONTACT } from "@/lib/config";
import { productsQuery } from "@/lib/queries";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  component: Home,
});

function Home() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const hot = products.filter((p) => p.tag === "HOT").slice(0, 8);
  const fresh = products.filter((p) => p.tag === "NEW").slice(0, 8);
  const sale = products.filter((p) => p.tag === "SALE").slice(0, 8);
  const featured = products.slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-background">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(var(--color-brand)_1px,transparent_1px),linear-gradient(90deg,var(--color-brand)_1px,transparent_1px)] [background-size:64px_64px]"
        />
        <div className="container-page relative grid gap-10 py-20 md:grid-cols-2 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center"
          >
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
              <Sparkles className="h-3.5 w-3.5" /> Premium electricals · Indore
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Your trusted electrical<br />
              <span className="text-brand">store in Indore.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-ink-muted sm:text-lg">
              Quality LED bulbs, decorative lights, fans, switches, wires and MCBs —
              hand-picked from the brands India trusts. Fair prices, fast WhatsApp
              checkout.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 px-7">
                <Link to="/products">
                  Shop now <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 border-brand/60 px-7 text-brand hover:bg-brand hover:text-brand-foreground"
              >
                <a
                  href={`https://wa.me/${CONTACT.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Contact us
                </a>
              </Button>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-4">
              <Feature icon={Truck} label="Fast delivery" />
              <Feature icon={ShieldCheck} label="Quality assured" />
              <Feature icon={Zap} label="WhatsApp checkout" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-brand/30 bg-card shadow-[var(--shadow-lift)]">
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-brand/10"
              />
              <img
                src="https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200"
                alt="Decorative lights"
                className="h-full w-full object-cover opacity-90"
              />
              <div className="absolute inset-x-6 bottom-6 rounded-2xl border border-brand/30 bg-background/85 p-4 backdrop-blur">
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">
                  Bestseller
                </div>
                <div className="mt-1 font-display text-lg font-bold text-foreground">
                  Warm Fairy String Lights
                </div>
                <div className="text-sm text-ink-muted">
                  Starting ₹479 · Limited stock
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-14">
        <SectionHeader title="Shop by category" subtitle="Everything electrical, sorted" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.slice(0, 12).map((c) => (
            <Link
              key={c}
              to="/products"
              search={{ category: c } as never}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-5 text-center transition-all hover:-translate-y-0.5 hover:border-brand/60 hover:shadow-[var(--shadow-lift)]"
            >
              <div className="grid h-12 w-12 place-items-center rounded-full border border-brand/40 bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold">{c}</span>
            </Link>
          ))}
        </div>
      </section>

      <ProductRow title="Hot right now" tag="HOT" items={hot.length ? hot : featured} />
      {sale.length > 0 && <ProductRow title="On sale" tag="SALE" items={sale} />}
      {fresh.length > 0 && <ProductRow title="Just landed" tag="NEW" items={fresh} />}

      {/* Why choose us */}
      <section className="container-page py-14">
        <SectionHeader
          title="Why choose Kishore Electronics"
          subtitle="Six reasons customers keep coming back"
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Quality products", desc: "Genuine brands only." },
            { icon: Award, title: "Trusted brands", desc: "Havells, Philips, Anchor & more." },
            { icon: Zap, title: "Affordable pricing", desc: "Fair, transparent rates." },
            { icon: Headphones, title: "Customer support", desc: "We're here on WhatsApp." },
            { icon: Truck, title: "Fast response", desc: "Same-day quotes for bulk." },
            { icon: Sparkles, title: "Huge collection", desc: "Everything electrical, one shop." },
          ].map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-brand/60 hover:shadow-[var(--shadow-lift)]"
            >
              <div className="grid h-11 w-11 place-items-center rounded-lg border border-brand/40 bg-brand/10 text-brand">
                <f.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 font-display font-semibold">{f.title}</div>
              <div className="mt-1 text-sm text-ink-muted">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="container-page py-14">
        <div className="grid gap-8 rounded-3xl border border-border bg-card p-8 md:grid-cols-2 md:p-12">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
              About us
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold">
              A premium electrical showroom you can trust.
            </h2>
            <p className="mt-4 leading-relaxed text-ink-muted">
              Kishore Electronics has been serving customers with high-quality
              electrical products, lighting solutions, switches, wires, fans,
              decorative lights and accessories. Our mission is to provide
              reliable products at competitive prices — backed by honest advice
              and excellent customer service.
            </p>
            <Button asChild className="mt-6 h-11">
              <Link to="/products">Explore the collection</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { k: "10k+", v: "Happy customers" },
              { k: "500+", v: "SKUs in stock" },
              { k: "25+", v: "Trusted brands" },
              { k: "6★", v: "Google rating" },
            ].map((s) => (
              <div
                key={s.v}
                className="rounded-2xl border border-brand/20 bg-background p-5 text-center"
              >
                <div className="font-display text-3xl font-bold text-brand">{s.k}</div>
                <div className="mt-1 text-xs uppercase tracking-widest text-ink-muted">
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram */}
      <section className="container-page py-14">
        <div className="overflow-hidden rounded-3xl border border-brand/30 bg-gradient-to-br from-brand/10 via-card to-background p-8 text-center md:p-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            <Instagram className="h-3.5 w-3.5" /> Instagram
          </div>
          <h3 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
            Follow us on Instagram
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-ink-muted">
            Latest arrivals, festive lighting inspiration and behind-the-scenes
            from our Indore showroom.
          </p>
          <Button asChild size="lg" className="mt-6 h-12 px-7">
            <a href={CONTACT.instagramUrl} target="_blank" rel="noreferrer">
              <Instagram className="mr-1 h-4 w-4" /> @{CONTACT.instagramHandle}
            </a>
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-20 pt-6">
        <div className="overflow-hidden rounded-3xl border border-brand/40 bg-brand text-brand-foreground">
          <div className="grid gap-6 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
            <div>
              <h3 className="font-display text-2xl font-bold sm:text-3xl">
                Bulk orders for contractors & retailers
              </h3>
              <p className="mt-2 max-w-xl text-sm text-brand-foreground/85">
                Best prices on wires, MCBs and lighting for projects.
                Message us on WhatsApp to get a custom quote.
              </p>
            </div>
            <Button asChild size="lg" variant="secondary" className="h-12 px-6">
              <a
                href={`https://wa.me/${CONTACT.whatsapp}`}
                target="_blank"
                rel="noreferrer"
              >
                Chat on WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <Icon className="h-5 w-5 text-brand" />
      <span className="text-xs font-medium text-ink-muted">{label}</span>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle?: string;
  href?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      {href && (
        <Link to={href} className="text-sm font-semibold text-brand hover:underline">
          View all →
        </Link>
      )}
    </div>
  );
}

function ProductRow({
  title,
  tag,
  items,
}: {
  title: string;
  tag: string;
  items: Product[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="container-page py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">Curated picks tagged {tag}</p>
        </div>
        <Link
          to="/products"
          search={{ tag } as never}
          className="text-sm font-semibold text-brand hover:underline"
        >
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.slice(0, 8).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
