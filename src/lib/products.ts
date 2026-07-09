import { SHEET_CSV_URL } from "./config";
import { listProductsFn } from "./sheets.functions";
import type { Product } from "./types";

// Sample fallback products used when SHEET_CSV_URL is not configured yet
// so the storefront still renders during setup.
const SAMPLE: Product[] = [
  {
    id: "KE-0001",
    category: "LED Bulbs",
    name: "9W LED Bulb Cool White",
    tag: "HOT",
    price: 199,
    discount: 30,
    discountedPrice: 139,
    stock: 120,
    images: [
      "https://images.unsplash.com/photo-1550985543-49bee3167284?w=800",
    ],
    description:
      "Energy-efficient 9W LED bulb with cool white light and long life.",
    instagramLink: "",
    active: true,
  },
  {
    id: "KE-0002",
    category: "Decorative Lights",
    name: "Warm Fairy String Lights 10m",
    tag: "NEW",
    price: 599,
    discount: 20,
    discountedPrice: 479,
    stock: 60,
    images: [
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800",
    ],
    description: "10 metre warm-white fairy lights, perfect for festive decor.",
    instagramLink: "",
    active: true,
  },
  {
    id: "KE-0003",
    category: "Extension Boards",
    name: "6A 4-Socket Extension Board 3m",
    tag: "SALE",
    price: 799,
    discount: 25,
    discountedPrice: 599,
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?w=800",
    ],
    description: "Heavy-duty 4-socket extension with ISI-marked 3m cable.",
    instagramLink: "",
    active: true,
  },
  {
    id: "KE-0004",
    category: "Fans",
    name: "Premium Ceiling Fan 1200mm",
    tag: "HOT",
    price: 2499,
    discount: 15,
    discountedPrice: 2124,
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1621607512214-68297480165e?w=800",
    ],
    description: "High-speed 1200mm ceiling fan with copper motor.",
    instagramLink: "",
    active: true,
  },
  {
    id: "KE-0005",
    category: "Switches",
    name: "Modular Switch 6A (Pack of 10)",
    tag: "",
    price: 450,
    discount: 10,
    discountedPrice: 405,
    stock: 80,
    images: [
      "https://images.unsplash.com/photo-1558002038-3f0f0b1c5f10?w=800",
    ],
    description: "Sleek modular switches with smooth toggle action.",
    instagramLink: "",
    active: true,
  },
  {
    id: "KE-0006",
    category: "MCBs",
    name: "16A Single Pole MCB",
    tag: "NEW",
    price: 249,
    discount: 0,
    discountedPrice: 249,
    stock: 100,
    images: [
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800",
    ],
    description: "Reliable 16A SP MCB for home distribution boards.",
    instagramLink: "",
    active: true,
  },
  {
    id: "KE-0007",
    category: "Rope Lights",
    name: "LED Rope Light 20m Multicolor",
    tag: "SALE",
    price: 899,
    discount: 33,
    discountedPrice: 599,
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=800",
    ],
    description: "Flexible outdoor-rated 20m multicolour LED rope light.",
    instagramLink: "",
    active: true,
  },
  {
    id: "KE-0008",
    category: "Wires",
    name: "1.5 sq mm Copper Wire 90m Coil",
    tag: "",
    price: 1499,
    discount: 5,
    discountedPrice: 1424,
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1587613864411-4a3f5b2f0d3d?w=800",
    ],
    description: "ISI-marked 1.5 sq mm copper wire, 90m coil.",
    instagramLink: "",
    active: true,
  },
];

function num(v: unknown): number {
  if (typeof v === "number") return v;
  const n = parseFloat(String(v ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function truthy(v: unknown): boolean {
  const s = String(v ?? "")
    .trim()
    .toLowerCase();
  return s === "yes" || s === "y" || s === "true" || s === "1" || s === "active";
}

function rowToProduct(row: Record<string, string>): Product | null {
  const id = (row["Product ID"] || row["ProductID"] || "").trim();
  const name = (row["Product Name"] || row["Name"] || "").trim();
  if (!id || !name) return null;
  const price = num(row["Product Price"] || row["Price"]);
  const discount = num(row["Discount"]);
  const discountedPrice =
    num(row["Discounted Price"]) ||
    (price && discount ? Math.round(price - (price * discount) / 100) : price);
  return {
    id,
    category: (row["Category"] || "").trim(),
    name,
    tag: ((row["Tag"] || "").trim().toUpperCase() as Product["tag"]) || "",
    price,
    discount,
    discountedPrice,
    stock: num(row["Product Stock"] || row["Stock"]),
    images: [row["Picture1"], row["Picture2"], row["Picture3"]]
      .map((s) => (s || "").trim())
      .filter(Boolean),
    description: (row["Description"] || "").trim(),
    instagramLink: (row["Instagram Product Link"] || "").trim(),
    active: truthy(row["Active"]),
  };
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const { products, error } = await listProductsFn();
    if (error) console.warn("listProductsFn:", error);
    const active = products.filter((p) => p.active);
    if (active.length) return active;
  } catch (e) {
    console.error("fetchProducts failed", e);
  }
  // Fallback: legacy CSV URL if configured, else sample data.
  if (SHEET_CSV_URL) {
    try {
      const Papa = (await import("papaparse")).default;
      const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
      const text = await res.text();
      const parsed = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
      });
      const list = parsed.data
        .map(rowToProduct)
        .filter((p): p is Product => !!p && p.active);
      if (list.length) return list;
    } catch {
      /* noop */
    }
  }
  return SAMPLE;
}