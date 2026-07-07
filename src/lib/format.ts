import { STORE } from "./config";

export function money(n: number): string {
  if (!Number.isFinite(n)) return `${STORE.currency}0`;
  return `${STORE.currency}${n.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

export function pad(n: number, len = 4): string {
  return n.toString().padStart(len, "0");
}