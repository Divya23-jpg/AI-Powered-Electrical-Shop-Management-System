import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Truck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES } from "@/lib/config";
import { productsQuery } from "@/lib/queries";

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
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-soft via-background to-background">
        <div className="container-page grid gap-10 py-16 md:grid-cols-2 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center"
          >
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
              <Sparkles className="h-3.5 w-3.5" /> Festive season is here
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
              Light up every corner of your home.
            </h1>
            <p className="mt-4 max-w-lg text-base text-ink-muted sm:text-lg">
              Premium LED bulbs, decorative lights, fans and electricals — all
              from Kishore Electronics, at prices that make sense.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 px-6">
                <Link to="/products">Shop all products <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-6">
                <Link to="/products" search={{ tag: "SALE" } as never}>View deals</Link>
              </Button>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
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
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-lift)]">
              <img
                src="https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200"
                alt="Decorative lights"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-6 bottom-6 rounded-2xl bg-background/95 p-4 backdrop-blur">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-brand">Bestseller</div>
                <div className="mt-1 font-display text-lg font-bold">Warm Fairy String Lights</div>
                <div className="text-sm text-ink-muted">Starting ₹479 · Limited stock</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-12">
        <SectionHeader title="Shop by category" subtitle="Everything electrical, sorted" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.slice(0, 12).map((c) => (
            <Link
              key={c}
              to="/products"
              search={{ category: c } as never}
              className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-[var(--shadow-card)]"
            >
              <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
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

      {/* CTA */}
      <section className="container-page pb-16 pt-6">
        <div className="overflow-hidden rounded-3xl bg-brand text-brand-foreground">
          <div className="grid gap-6 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
            <div>
              <h3 className="font-display text-2xl font-bold sm:text-3xl">
                Bulk orders for contractors & retailers
              </h3>
              <p className="mt-2 max-w-xl text-sm text-brand-foreground/85">
                Get the best prices on wires, MCBs and lighting for projects.
                Message us on WhatsApp to get a custom quote.
              </p>
            </div>
            <Button asChild size="lg" variant="secondary" className="h-12 px-6">
              <a href="https://wa.me/917415500492" target="_blank" rel="noreferrer">
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

function SectionHeader({ title, subtitle, href }: { title: string; subtitle?: string; href?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
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

import type { Product } from "@/lib/types";
function ProductRow({ title, tag, items }: { title: string; tag: string; items: Product[] }) {
  if (items.length === 0) return null;
  return (
    <section className="container-page py-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
          <p className="mt-1 text-sm text-ink-muted">Curated picks tagged {tag}</p>
        </div>
        <Link to="/products" search={{ tag } as never} className="text-sm font-semibold text-brand hover:underline">
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
