import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, TrendingUp, Users, IndianRupee } from "lucide-react";
import { money } from "@/lib/format";
import { ordersQuery } from "@/lib/queries";
import { APPS_SCRIPT_URL } from "@/lib/config";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Kishor Electronics" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { data: orders = [], isLoading } = useQuery(ordersQuery);

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

      {!APPS_SCRIPT_URL && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <b>Setup needed:</b> add your Apps Script Web App URL in{" "}
          <code>src/lib/config.ts</code> (or set <code>VITE_APPS_SCRIPT_URL</code>){" "}
          to load orders here.
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={IndianRupee} label="Revenue" value={money(revenue)} />
        <Stat icon={Package} label="Orders" value={String(orders.length)} />
        <Stat icon={Users} label="Customers" value={String(customers)} />
        <Stat icon={TrendingUp} label="Avg. order" value={money(orders.length ? revenue / orders.length : 0)} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
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