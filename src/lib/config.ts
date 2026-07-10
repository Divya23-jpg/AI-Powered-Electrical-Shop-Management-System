// Kishore Electronics — runtime configuration.
// Drop your Google Sheet published CSV URL and Apps Script Web App URL here,
// or set the matching VITE_* env vars.

export const SHEET_CSV_URL: string =
  (import.meta.env.VITE_SHEET_CSV_URL as string | undefined) ??
  // "Publish to web" CSV link for the Products sheet
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbN8OeLji3qiEB_RgV4jACai3xepg_9qPDGXvkF8iBjo_pNrGLt-jQiRkc67dW2cw1XIadi-Agim1K/pub?gid=0&single=true&output=csv";

export const APPS_SCRIPT_URL: string =
  (import.meta.env.VITE_APPS_SCRIPT_URL as string | undefined) ??
  // TODO: paste your Apps Script Web App URL that appends to the Orders tab
  "";

// Google Sheet backing the storefront. Read/write happens server-side via
// the Lovable Google Sheets connector (see src/lib/sheets.functions.ts).
export const SHEETS_SPREADSHEET_ID: string =
  (import.meta.env.VITE_SHEETS_SPREADSHEET_ID as string | undefined) ??
  "1yBYV0mrII05xT85syzP6o_ksYQFzVokNsN6nMofiNHc";

export const PRODUCTS_SHEET = "Products";
export const ORDERS_SHEET = "Orders";

export const PRODUCT_HEADERS = [
  "Product ID",
  "Category",
  "Product Name",
  "Tag",
  "Product Price",
  "Discount",
  "Discounted Price",
  "Product Stock",
  "Picture1",
  "Picture2",
  "Picture3",
  "Description",
  "Instagram Product Link",
  "Active",
] as const;

export const ORDER_HEADERS = [
  "Order ID",
  "Created At",
  "Customer Name",
  "Phone",
  "Email",
  "Address",
  "City",
  "Pincode",
  "Notes",
  "Items JSON",
  "Subtotal",
  "Total",
] as const;

export const STORE = {
  name: "Kishore Electronics",
  tagline: "Lighting & Electricals for Every Home",
  whatsappNumber: "917415500492", // +91 7415500492
  currency: "₹",
  supportEmail: "support@kisore_electronics.in",
  address: "815 Gandhi Chowk, Indore, MP",
};

export const CONTACT = {
  phone: "7415500492",
  phoneDisplay: "+91 74155 00492",
  whatsapp: "917415500492",
  instagramHandle: "kisore_electronics",
  instagramUrl: "https://www.instagram.com/kisore_electronics",
  addressLines: ["815 Gandhi Chowk", "Indore, Madhya Pradesh, India"],
};

export const CATEGORIES = [
  "Decorative Lights",
  "LED Bulbs",
  "Rope Lights",
  "Holders",
  "Switches",
  "Extension Boards",
  "Series Lights",
  "Fans",
  "MCBs",
  "Wires",
  "Accessories",
];