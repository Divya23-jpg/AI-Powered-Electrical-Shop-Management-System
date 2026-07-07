// Kishor Electronics — runtime configuration.
// Drop your Google Sheet published CSV URL and Apps Script Web App URL here,
// or set the matching VITE_* env vars.

export const SHEET_CSV_URL: string =
  (import.meta.env.VITE_SHEET_CSV_URL as string | undefined) ??
  // TODO: paste your "Publish to web" CSV link for the Products sheet
  "";

export const APPS_SCRIPT_URL: string =
  (import.meta.env.VITE_APPS_SCRIPT_URL as string | undefined) ??
  // TODO: paste your Apps Script Web App URL that appends to the Orders tab
  "";

export const STORE = {
  name: "Kishor Electronics",
  tagline: "Lighting & Electricals for Every Home",
  whatsappNumber: "919407123853", // +91 9407123853
  currency: "₹",
  supportEmail: "support@kishorelectronics.in",
  address: "Kishor Electronics, India",
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