"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Order, OrderItem } from "@/lib/types";

export async function getOrdersByPhone(phone: string) {
  const trimmed = phone.trim();
  if (!trimmed) return [];

  const supabase = createAdminClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_phone", trimmed)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!orders || orders.length === 0) return [];

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .in(
      "order_id",
      orders.map((o) => o.id)
    );

  return (orders as Order[]).map((order) => ({
    ...order,
    items: ((items as OrderItem[]) || []).filter((i) => i.order_id === order.id),
  }));
}
