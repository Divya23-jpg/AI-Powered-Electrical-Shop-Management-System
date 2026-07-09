import { createServerFn } from "@tanstack/react-start";
import {
  SHEETS_SPREADSHEET_ID,
  PRODUCTS_SHEET,
  ORDERS_SHEET,
  PRODUCT_HEADERS,
  ORDER_HEADERS,
} from "./config";
import type { Product, Order } from "./types";

// -------- gateway helper (server-only) --------

const GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";

async function sheets(
  path: string,
  init: { method?: string; query?: Record<string, string>; body?: unknown } = {},
) {
  const apiKey = process.env.LOVABLE_API_KEY;
  const connKey = process.env.GOOGLE_SHEETS_API_KEY;
  if (!apiKey || !connKey) {
    throw new Error("Google Sheets connector not configured");
  }
  const qs = init.query
    ? "?" +
      Object.entries(init.query)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&")
    : "";
  const res = await fetch(`${GATEWAY}${path}${qs}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "X-Connection-Api-Key": connKey,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Sheets ${res.status}: ${text.slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : {};
}

// -------- row <-> object helpers --------

function num(v: unknown): number {
  if (typeof v === "number") return v;
  const n = parseFloat(String(v ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}
function truthy(v: unknown): boolean {
  const s = String(v ?? "").trim().toLowerCase();
  return s === "yes" || s === "y" || s === "true" || s === "1" || s === "active";
}

function rowToProduct(row: string[]): Product | null {
  const [
    id, category, name, tag, price, discount, discountedPrice, stock,
    p1, p2, p3, description, instagram, active,
  ] = row;
  if (!id || !name) return null;
  const priceN = num(price);
  const discountN = num(discount);
  const discountedN =
    num(discountedPrice) ||
    (priceN && discountN
      ? Math.round(priceN - (priceN * discountN) / 100)
      : priceN);
  return {
    id: String(id).trim(),
    category: (category || "").trim(),
    name: String(name).trim(),
    tag: ((tag || "").trim().toUpperCase() as Product["tag"]) || "",
    price: priceN,
    discount: discountN,
    discountedPrice: discountedN,
    stock: num(stock),
    images: [p1, p2, p3].map((s) => (s || "").trim()).filter(Boolean),
    description: (description || "").trim(),
    instagramLink: (instagram || "").trim(),
    active: truthy(active),
  };
}

function productToRow(p: Product): (string | number)[] {
  return [
    p.id,
    p.category,
    p.name,
    p.tag || "",
    p.price,
    p.discount,
    p.discountedPrice,
    p.stock,
    p.images[0] || "",
    p.images[1] || "",
    p.images[2] || "",
    p.description,
    p.instagramLink,
    p.active ? "Yes" : "No",
  ];
}

function rowToOrder(row: string[]): Order | null {
  const [
    orderId, createdAt, name, phone, email, address, city, pincode,
    notes, itemsJson, subtotal, total,
  ] = row;
  if (!orderId) return null;
  let items: Order["items"] = [];
  try { items = JSON.parse(itemsJson || "[]"); } catch { /* noop */ }
  return {
    orderId,
    createdAt: createdAt || new Date().toISOString(),
    customer: {
      name: name || "",
      phone: phone || "",
      email: email || "",
      address: address || "",
      city: city || "",
      pincode: pincode || "",
      notes: notes || "",
    },
    items,
    subtotal: num(subtotal),
    total: num(total),
  };
}

function orderToRow(o: Order): (string | number)[] {
  return [
    o.orderId,
    o.createdAt,
    o.customer.name,
    o.customer.phone,
    o.customer.email || "",
    o.customer.address,
    o.customer.city,
    o.customer.pincode,
    o.customer.notes || "",
    JSON.stringify(o.items),
    o.subtotal,
    o.total,
  ];
}

// -------- tab bootstrap --------

async function ensureTab(title: string, headers: readonly string[]) {
  const meta = await sheets(`/spreadsheets/${SHEETS_SPREADSHEET_ID}`, {
    query: { fields: "sheets(properties(title))" },
  });
  const exists = (meta.sheets || []).some(
    (s: { properties?: { title?: string } }) => s.properties?.title === title,
  );
  if (!exists) {
    await sheets(`/spreadsheets/${SHEETS_SPREADSHEET_ID}:batchUpdate`, {
      method: "POST",
      body: {
        requests: [{ addSheet: { properties: { title } } }],
      },
    });
  }
  // Ensure header row present
  const range = `${title}!A1:${String.fromCharCode(64 + headers.length)}1`;
  const cur = await sheets(
    `/spreadsheets/${SHEETS_SPREADSHEET_ID}/values/${range}`,
  );
  const row = (cur.values && cur.values[0]) || [];
  const same =
    row.length === headers.length &&
    row.every((v: string, i: number) => v === headers[i]);
  if (!same) {
    await sheets(
      `/spreadsheets/${SHEETS_SPREADSHEET_ID}/values/${range}`,
      {
        method: "PUT",
        query: { valueInputOption: "RAW" },
        body: { values: [headers as unknown as string[]] },
      },
    );
  }
}

// -------- server functions --------

export const listProductsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const range = `${PRODUCTS_SHEET}!A2:N`;
      const res = await sheets(
        `/spreadsheets/${SHEETS_SPREADSHEET_ID}/values/${range}`,
      );
      const rows: string[][] = res.values || [];
      const products = rows
        .map(rowToProduct)
        .filter((p): p is Product => !!p);
      return { products, error: null as string | null };
    } catch (e) {
      return {
        products: [] as Product[],
        error: e instanceof Error ? e.message : "sheets error",
      };
    }
  },
);

export const bootstrapSheetsFn = createServerFn({ method: "POST" }).handler(
  async () => {
    await ensureTab(PRODUCTS_SHEET, PRODUCT_HEADERS);
    await ensureTab(ORDERS_SHEET, ORDER_HEADERS);
    return { ok: true };
  },
);

export const upsertProductFn = createServerFn({ method: "POST" })
  .inputValidator((data: { product: Product }) => data)
  .handler(async ({ data }) => {
    await ensureTab(PRODUCTS_SHEET, PRODUCT_HEADERS);
    const range = `${PRODUCTS_SHEET}!A2:A`;
    const res = await sheets(
      `/spreadsheets/${SHEETS_SPREADSHEET_ID}/values/${range}`,
    );
    const rows: string[][] = res.values || [];
    const idx = rows.findIndex(
      (r) => (r[0] || "").trim() === data.product.id.trim(),
    );
    const row = productToRow(data.product);
    if (idx >= 0) {
      const rowNum = idx + 2;
      await sheets(
        `/spreadsheets/${SHEETS_SPREADSHEET_ID}/values/${PRODUCTS_SHEET}!A${rowNum}:N${rowNum}`,
        {
          method: "PUT",
          query: { valueInputOption: "USER_ENTERED" },
          body: { values: [row] },
        },
      );
    } else {
      await sheets(
        `/spreadsheets/${SHEETS_SPREADSHEET_ID}/values/${PRODUCTS_SHEET}!A:N:append`,
        {
          method: "POST",
          query: { valueInputOption: "USER_ENTERED" },
          body: { values: [row] },
        },
      );
    }
    return { ok: true };
  });

export const deleteProductFn = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const range = `${PRODUCTS_SHEET}!A2:A`;
    const res = await sheets(
      `/spreadsheets/${SHEETS_SPREADSHEET_ID}/values/${range}`,
    );
    const rows: string[][] = res.values || [];
    const idx = rows.findIndex((r) => (r[0] || "").trim() === data.id.trim());
    if (idx < 0) return { ok: false };
    const rowNum = idx + 2;
    // soft delete: set Active=No
    await sheets(
      `/spreadsheets/${SHEETS_SPREADSHEET_ID}/values/${PRODUCTS_SHEET}!N${rowNum}`,
      {
        method: "PUT",
        query: { valueInputOption: "RAW" },
        body: { values: [["No"]] },
      },
    );
    return { ok: true };
  });

export const appendOrderFn = createServerFn({ method: "POST" })
  .inputValidator((data: { order: Order }) => data)
  .handler(async ({ data }) => {
    await ensureTab(ORDERS_SHEET, ORDER_HEADERS);
    await sheets(
      `/spreadsheets/${SHEETS_SPREADSHEET_ID}/values/${ORDERS_SHEET}!A:L:append`,
      {
        method: "POST",
        query: { valueInputOption: "USER_ENTERED" },
        body: { values: [orderToRow(data.order)] },
      },
    );
    return { ok: true };
  });

export const listOrdersFn = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const range = `${ORDERS_SHEET}!A2:L`;
      const res = await sheets(
        `/spreadsheets/${SHEETS_SPREADSHEET_ID}/values/${range}`,
      );
      const rows: string[][] = res.values || [];
      const orders = rows
        .map(rowToOrder)
        .filter((o): o is Order => !!o)
        .reverse();
      return { orders, error: null as string | null };
    } catch (e) {
      return {
        orders: [] as Order[],
        error: e instanceof Error ? e.message : "sheets error",
      };
    }
  },
);