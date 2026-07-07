import { queryOptions } from "@tanstack/react-query";
import { fetchProducts } from "./products";
import { fetchOrders } from "./orders";

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