import { queryOptions } from "@tanstack/react-query";
import { fetchProducts } from "./products";
import { fetchOrders } from "./orders";
import { listSheet1Fn } from "./sheets.functions";

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: fetchProducts,
  staleTime: 60_000,
});

export const ordersQuery = queryOptions({
  queryKey: ["orders"],
  queryFn: fetchOrders,
  staleTime: 30_000,
});

export const sheet1Query = queryOptions({
  queryKey: ["sheet1"],
  queryFn: () => listSheet1Fn(),
  staleTime: 30_000,
});