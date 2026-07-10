import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Package, TrendingUp, Users, IndianRupee, Plus, Pencil, Trash2, Save, X,
} from "lucide-react";
import { money } from "@/lib/format";
import { ordersQuery, productsQuery } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  upsertProductFn, deleteProductFn, bootstrapSheetsFn,
} from "@/lib/sheets.functions";
import { CATEGORIES } from "@/lib/config";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Kishore Electronics" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const qc = useQueryClient();
  const { data: orders = [], isLoading } = useQuery(ordersQuery);
  const { data: products = [] } = useQuery(productsQuery);
  const [tab, setTab] = useState<"orders" | "products">("orders");
  const [editing, setEditing] = useState<Product | null>(null);

  const saveMut = useMutation({
    mutationFn: (product: Product) => upsertProductFn({ data: { product } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      setEditing(null);
    },
  });
  const delMut = useMutation({
    mutationFn: (id: string) => deleteProductFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
  const bootstrapMut = useMutation({
    mutationFn: () => bootstrapSheetsFn(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const revenue = orders.reduce((n, o) => n + (o.total || 0), 0);
  const customers = new Set(orders.map((o) => o.customer?.phone)).size;
  const productCount: Record<string, number> = {};
  for (const o of orders) {
    for (const it of o.items || []) {
      productCount[it.name] = (productCount[it.name] || 0) + it.quantity;
    }
  }
  const topProducts = Object.entries(productCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="container-page py-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Admin dashboard</h1>
          <p className="text-sm text-ink-muted">Overview of orders from Google Sheets.</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => bootstrapMut.mutate()}
          disabled={bootstrapMut.isPending}
        >
          {bootstrapMut.isPending ? "Setting up…" : "Initialise sheet tabs"}
        </Button>
        <span className="text-xs text-ink-muted self-center">
          Creates Products &amp; Orders tabs with the correct headers if they don't exist.
        </span>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={IndianRupee} label="Revenue" value={money(revenue)} />
        <Stat icon={Package} label="Orders" value={String(orders.length)} />
        <Stat icon={Users} label="Customers" value={String(customers)} />
        <Stat icon={TrendingUp} label="Avg. order" value={money(orders.length ? revenue / orders.length : 0)} />
      </div>

      <div className="mt-6 flex gap-2 border-b border-border">
        {(["orders", "products"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "px-4 py-2 text-sm font-semibold capitalize " +
              (tab === t
                ? "border-b-2 border-brand text-brand"
                : "text-ink-muted hover:text-foreground")
            }
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "orders" && (
      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border p-4 font-semibold">Recent orders</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-alt text-left text-xs uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td className="px-4 py-6 text-ink-muted" colSpan={4}>Loading…</td></tr>
                )}
                {!isLoading && orders.length === 0 && (
                  <tr><td className="px-4 py-6 text-ink-muted" colSpan={4}>No orders yet.</td></tr>
                )}
                {orders.map((o) => (
                  <tr key={o.orderId} className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-xs">{o.orderId}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{o.customer?.name}</div>
                      <div className="text-xs text-ink-muted">{o.customer?.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {(o.items || []).reduce((n, i) => n + i.quantity, 0)} items
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{money(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="font-semibold">Top products</div>
          <ul className="mt-3 space-y-2 text-sm">
            {topProducts.length === 0 && (
              <li className="text-ink-muted">No data yet.</li>
            )}
            {topProducts.map(([name, qty]) => (
              <li key={name} className="flex items-center justify-between gap-2">
                <span className="line-clamp-1">{name}</span>
                <span className="shrink-0 text-ink-muted">{qty} sold</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      )}

      {tab === "products" && (
        <div className="mt-6">
          <div className="mb-4 flex justify-between">
            <div className="text-sm text-ink-muted">
              {products.length} product{products.length === 1 ? "" : "s"} in sheet
            </div>
            <Button
              size="sm"
              onClick={() =>
                setEditing({
                  id: `KE-${String(Date.now()).slice(-4)}`,
                  category: CATEGORIES[0],
                  name: "",
                  tag: "",
                  price: 0,
                  discount: 0,
                  discountedPrice: 0,
                  stock: 0,
                  images: [],
                  description: "",
                  instagramLink: "",
                  active: true,
                })
              }
            >
              <Plus className="mr-1 h-4 w-4" /> New product
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-alt text-left text-xs uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3 text-ink-muted">{p.category}</td>
                    <td className="px-4 py-3 text-right">{money(p.discountedPrice)}</td>
                    <td className="px-4 py-3 text-right">{p.stock}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditing(p)}
                        className="mr-2 inline-flex items-center gap-1 text-brand hover:underline"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Deactivate ${p.name}?`)) delMut.mutate(p.id);
                        }}
                        className="inline-flex items-center gap-1 text-red-600 hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-6 text-ink-muted">No products in sheet yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing && (
        <ProductEditor
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={(p) => saveMut.mutate(p)}
          saving={saveMut.isPending}
        />
      )}
    </div>
  );
}

function ProductEditor({
  initial, onSave, onCancel, saving,
}: {
  initial: Product;
  onSave: (p: Product) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [p, setP] = useState<Product>(initial);
  const set = <K extends keyof Product>(k: K, v: Product[K]) =>
    setP((prev) => ({ ...prev, [k]: v }));

  const discounted =
    p.price && p.discount
      ? Math.round(p.price - (p.price * p.discount) / 100)
      : p.price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">
            {initial.name ? "Edit product" : "New product"}
          </h2>
          <button onClick={onCancel} className="text-ink-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Product ID"><Input value={p.id} onChange={(e) => set("id", e.target.value)} /></Field>
          <Field label="Category">
            <select
              value={p.category}
              onChange={(e) => set("category", e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Name" full><Input value={p.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Tag">
            <select
              value={p.tag}
              onChange={(e) => set("tag", e.target.value as Product["tag"])}
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="">None</option>
              <option value="HOT">HOT</option>
              <option value="NEW">NEW</option>
              <option value="SALE">SALE</option>
            </select>
          </Field>
          <Field label="Active">
            <select
              value={p.active ? "yes" : "no"}
              onChange={(e) => set("active", e.target.value === "yes")}
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </Field>
          <Field label="Price (₹)"><Input type="number" value={p.price} onChange={(e) => set("price", Number(e.target.value))} /></Field>
          <Field label="Discount %"><Input type="number" value={p.discount} onChange={(e) => set("discount", Number(e.target.value))} /></Field>
          <Field label="Discounted Price (auto)">
            <Input type="number" value={p.discountedPrice || discounted} onChange={(e) => set("discountedPrice", Number(e.target.value))} />
          </Field>
          <Field label="Stock"><Input type="number" value={p.stock} onChange={(e) => set("stock", Number(e.target.value))} /></Field>
          <Field label="Picture 1 URL" full><Input value={p.images[0] || ""} onChange={(e) => set("images", [e.target.value, p.images[1] || "", p.images[2] || ""].filter(Boolean))} /></Field>
          <Field label="Picture 2 URL" full><Input value={p.images[1] || ""} onChange={(e) => set("images", [p.images[0] || "", e.target.value, p.images[2] || ""].filter(Boolean))} /></Field>
          <Field label="Picture 3 URL" full><Input value={p.images[2] || ""} onChange={(e) => set("images", [p.images[0] || "", p.images[1] || "", e.target.value].filter(Boolean))} /></Field>
          <Field label="Description" full><Textarea rows={3} value={p.description} onChange={(e) => set("description", e.target.value)} /></Field>
          <Field label="Instagram Link" full><Input value={p.instagramLink} onChange={(e) => set("instagramLink", e.target.value)} /></Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button
            onClick={() =>
              onSave({
                ...p,
                discountedPrice: p.discountedPrice || discounted,
              })
            }
            disabled={saving || !p.id || !p.name}
          >
            <Save className="mr-1 h-4 w-4" /> {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <Label className="mb-1 block text-xs">{label}</Label>
      {children}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-ink-muted">{label}</span>
        <Icon className="h-4 w-4 text-brand" />
      </div>
      <div className="mt-2 font-display text-2xl font-bold">{value}</div>
    </div>
  );
}