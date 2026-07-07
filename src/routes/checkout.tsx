import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { money } from "@/lib/format";
import { useCart } from "@/lib/store";
import { makeOrder, saveOrder, whatsappUrl } from "@/lib/orders";
import type { Order } from "@/lib/types";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Kishor Electronics" },
      { name: "description", content: "Complete your order via WhatsApp." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number"),
  email: z.string().trim().email("Invalid email").max(120).optional().or(z.literal("")),
  address: z.string().trim().min(5, "Enter your address").max(240),
  city: z.string().trim().min(2).max(60),
  pincode: z.string().trim().regex(/^\d{4,10}$/, "Enter a valid pincode"),
  notes: z.string().max(400).optional(),
});

function CheckoutPage() {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const navigate = useNavigate();
  const total = items.reduce((n, i) => n + i.price * i.quantity, 0);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  if (items.length === 0 && !placedOrder) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
        <Button asChild className="mt-6"><Link to="/products">Shop products</Link></Button>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        errs[issue.path[0] as string] = issue.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const customer = {
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || undefined,
      address: parsed.data.address,
      city: parsed.data.city,
      pincode: parsed.data.pincode,
      notes: parsed.data.notes || undefined,
    };
    const order = makeOrder(items, customer);
    await saveOrder(order);
    setPlacedOrder(order);
    clear();
    // Open WhatsApp
    if (typeof window !== "undefined") {
      window.open(whatsappUrl(order), "_blank", "noopener,noreferrer");
    }
    setSubmitting(false);
  };

  if (placedOrder) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold">Order placed!</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Your order <span className="font-semibold text-ink">{placedOrder.orderId}</span> has been recorded.
          </p>
          <p className="mt-3 text-sm text-ink-muted">
            We&apos;ve opened WhatsApp with your order summary. If it didn&apos;t open,
            click below to send us the details manually.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <a href={whatsappUrl(placedOrder)} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-1 h-4 w-4" /> Open WhatsApp
              </a>
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate({ to: "/" })}>
              Back to home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="font-display text-3xl font-bold">Checkout</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Fill in your details. We&apos;ll confirm your order on WhatsApp.
      </p>
      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Field id="name" label="Full name" value={form.name} error={errors.name}
            onChange={(v) => setForm({ ...form, name: v })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="phone" label="Phone" value={form.phone} error={errors.phone}
              onChange={(v) => setForm({ ...form, phone: v })} />
            <Field id="email" label="Email (optional)" type="email" value={form.email} error={errors.email}
              onChange={(v) => setForm({ ...form, email: v })} />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" rows={3} value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="mt-1"
            />
            {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="city" label="City" value={form.city} error={errors.city}
              onChange={(v) => setForm({ ...form, city: v })} />
            <Field id="pincode" label="Pincode" value={form.pincode} error={errors.pincode}
              onChange={(v) => setForm({ ...form, pincode: v })} />
          </div>
          <div>
            <Label htmlFor="notes">Order notes (optional)</Label>
            <Textarea id="notes" rows={2} value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>
        <aside className="h-fit rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Your order</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((it) => (
              <li key={it.productId} className="flex items-start justify-between gap-2">
                <span className="line-clamp-2">
                  {it.name} <span className="text-ink-muted">× {it.quantity}</span>
                </span>
                <span className="shrink-0 font-semibold">{money(it.price * it.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-4 font-display text-lg font-bold">
            <span>Total</span><span>{money(total)}</span>
          </div>
          <Button type="submit" size="lg" className="mt-6 w-full gap-2" disabled={submitting}>
            <MessageCircle className="h-4 w-4" />
            {submitting ? "Placing order…" : "Place order & open WhatsApp"}
          </Button>
          <p className="mt-3 text-xs text-ink-muted">
            Your order is saved before we open WhatsApp with a summary you can send.
          </p>
        </aside>
      </form>
    </div>
  );
}

function Field({
  id, label, value, onChange, error, type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1" />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}