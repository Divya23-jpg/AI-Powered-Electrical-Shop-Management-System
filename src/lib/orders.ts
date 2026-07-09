import { APPS_SCRIPT_URL, STORE } from "./config";
import { appendOrderFn, listOrdersFn } from "./sheets.functions";
import { pad, money } from "./format";
import type { CartItem, CustomerDetails, Order } from "./types";

export function generateOrderId(seq = 1): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1, 2);
  const day = pad(d.getDate(), 2);
  const counterKey = `ke-order-counter-${y}${m}${day}`;
  let next = seq;
  if (typeof window !== "undefined") {
    const cur = parseInt(localStorage.getItem(counterKey) || "0", 10) || 0;
    next = cur + 1;
    localStorage.setItem(counterKey, String(next));
  }
  return `KE-${y}${m}${day}-${pad(next, 4)}`;
}

export function buildWhatsAppMessage(order: Order): string {
  const lines: string[] = [];
  lines.push(`*New Order — ${STORE.name}*`);
  lines.push(`Order ID: ${order.orderId}`);
  lines.push(`Date: ${new Date(order.createdAt).toLocaleString("en-IN")}`);
  lines.push("");
  lines.push(`*Customer*`);
  lines.push(`Name: ${order.customer.name}`);
  lines.push(`Phone: ${order.customer.phone}`);
  if (order.customer.email) lines.push(`Email: ${order.customer.email}`);
  lines.push(`Address: ${order.customer.address}`);
  lines.push(`City: ${order.customer.city} - ${order.customer.pincode}`);
  if (order.customer.notes) lines.push(`Notes: ${order.customer.notes}`);
  lines.push("");
  lines.push(`*Items*`);
  order.items.forEach((it, i) => {
    lines.push(
      `${i + 1}. ${it.name} × ${it.quantity} — ${money(it.price * it.quantity)}`,
    );
  });
  lines.push("");
  lines.push(`*Total: ${money(order.total)}*`);
  lines.push("");
  lines.push(`Please confirm this order. Thank you!`);
  return lines.join("\n");
}

export function whatsappUrl(order: Order): string {
  const text = encodeURIComponent(buildWhatsAppMessage(order));
  return `https://wa.me/${STORE.whatsappNumber}?text=${text}`;
}

export async function saveOrder(order: Order): Promise<void> {
  try {
    await appendOrderFn({ data: { order } });
    return;
  } catch (e) {
    console.error("saveOrder (sheets) failed", e);
  }
  // Legacy fallback: Apps Script webhook, if configured.
  if (!APPS_SCRIPT_URL) return;
  try {
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "createOrder", order }),
    });
  } catch (e) {
    console.error("saveOrder (apps script) failed", e);
  }
}

export function orderTotal(items: CartItem[]): number {
  return items.reduce((s, it) => s + it.price * it.quantity, 0);
}

export function makeOrder(
  items: CartItem[],
  customer: CustomerDetails,
): Order {
  const total = orderTotal(items);
  return {
    orderId: generateOrderId(),
    createdAt: new Date().toISOString(),
    customer,
    items,
    subtotal: total,
    total,
  };
}

export async function fetchOrders(): Promise<Order[]> {
  try {
    const { orders } = await listOrdersFn();
    return orders;
  } catch (e) {
    console.error("fetchOrders failed", e);
    return [];
  }
}