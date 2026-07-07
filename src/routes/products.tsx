import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES } from "@/lib/config";
import { productsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

const search = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  sort: z.enum(["popular", "price-asc", "price-desc", "discount"]).optional(),
  page: z.number().int().min(1).optional(),
});

export const Route = createFileRoute("/products")({
  validateSearch: search,
  loaderDeps: ({ search: s }) => ({ s }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  head: () => ({
    meta: [
      { title: "All Products — Kishor Electronics" },
      { name: "description", content: "Browse LED bulbs, decorative lights, fans, switches, MCBs, wires and more." },
      { property: "og:title", content: "All Products — Kishor Electronics" },
      { property: "og:description", content: "Browse our full range of lighting and electricals." },
    ],
  }),
  component: ProductsPage,
});

const PER_PAGE = 12;

function ProductsPage() {
  const { data: all } = useSuspenseQuery(productsQuery);
  const sp = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(sp.q ?? "");

  const category = sp.category ?? "";
  const tag = sp.tag ?? "";
  const sort = sp.sort ?? "popular";
  const page = sp.page ?? 1;

  const filtered = useMemo(() => {
    let list = all.slice();
    if (category) list = list.filter((p) => p.category === category);
    if (tag) list = list.filter((p) => p.tag === tag);
    const query = (sp.q ?? "").trim().toLowerCase();
    if (query)
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query),
      );
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.discountedPrice - b.discountedPrice);
        break;
      case "price-desc":
        list.sort((a, b) => b.discountedPrice - a.discountedPrice);
        break;
      case "discount":
        list.sort((a, b) => b.discount - a.discount);
        break;
    }
    return list;
  }, [all, category, tag, sp.q, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const clamped = Math.min(page, totalPages);
  const shown = filtered.slice((clamped - 1) * PER_PAGE, clamped * PER_PAGE);

  const setSearch = (patch: Record<string, unknown>) => {
    navigate({
      search: (prev: Record<string, unknown>) =>
        ({ ...prev, page: 1, ...patch }) as never,
    });
  };

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">
            {category || tag ? `${category || tag}` : "All Products"}
          </h1>
          <p className="text-sm text-ink-muted">
            {filtered.length} product{filtered.length === 1 ? "" : "s"}
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearch({ q: q || undefined });
          }}
          className="flex gap-2"
        >
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products"
            className="h-10 w-56"
          />
          <select
            value={sort}
            onChange={(e) => setSearch({ sort: e.target.value })}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="popular">Sort: Popular</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="discount">Biggest Discount</option>
          </select>
        </form>
      </div>

      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <aside className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-muted">
              Category
            </h3>
            <div className="flex flex-col gap-1 text-sm">
              <button
                onClick={() => setSearch({ category: undefined })}
                className={cn(
                  "rounded-md px-2 py-1.5 text-left hover:bg-muted",
                  !category && "bg-brand-soft text-brand font-semibold",
                )}
              >
                All categories
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setSearch({ category: c })}
                  className={cn(
                    "rounded-md px-2 py-1.5 text-left hover:bg-muted",
                    category === c && "bg-brand-soft text-brand font-semibold",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-muted">
              Tag
            </h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {["HOT", "NEW", "SALE"].map((t) => (
                <button
                  key={t}
                  onClick={() => setSearch({ tag: tag === t ? undefined : t })}
                  className={cn(
                    "rounded-full border border-border px-3 py-1 font-semibold",
                    tag === t
                      ? "border-brand bg-brand text-brand-foreground"
                      : "hover:border-brand hover:text-brand",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div>
          {shown.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <p className="text-sm text-ink-muted">No products match your filters.</p>
              <Button asChild variant="link">
                <Link to="/products">Clear filters</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {shown.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (n) => (
                      <button
                        key={n}
                        onClick={() => setSearch({ page: n })}
                        className={cn(
                          "grid h-9 w-9 place-items-center rounded-md border border-border text-sm",
                          n === clamped
                            ? "border-brand bg-brand text-brand-foreground"
                            : "hover:bg-muted",
                        )}
                      >
                        {n}
                      </button>
                    ),
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}