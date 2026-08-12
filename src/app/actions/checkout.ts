"use server";

import { createClient } from "@/lib/supabase/server";
import type { CartItem } from "@/lib/types";
import { randomUUID } from "crypto";

export type CheckoutInput = {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  notes?: string;
  items: CartItem[];
};

export type CheckoutResult =
  | { ok: true; orderNumber: string }
  | { ok: false; error: string };

function generateOrderNumber() {
  const now = new Date();
  const stamp = now
    .toISOString()
    .replace(/[-:T.Z]/g, "")
    .slice(0, 12);
  const rand = Math.floor(Math.random() * 900 + 100);
  return `ORD-${stamp}-${rand}`;
}

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  if (!input.customerName.trim() || !input.customerPhone.trim() || !input.customerAddress.trim()) {
    return { ok: false, error: "Nama, no. HP, dan alamat wajib diisi." };
  }
  if (input.items.length === 0) {
    return { ok: false, error: "Keranjang masih kosong." };
  }

  const supabase = await createClient();

  // Re-validasi stok terbaru sebelum membuat order
  const ids = input.items.map((i) => i.product_id);
  const { data: freshProducts, error: fetchErr } = await supabase
    .from("products")
    .select("id, stock, price, discount_price, is_active")
    .in("id", ids);

  if (fetchErr || !freshProducts) {
    return { ok: false, error: "Gagal memvalidasi stok produk." };
  }

  for (const item of input.items) {
    const p = freshProducts.find((fp) => fp.id === item.product_id);
    if (!p || !p.is_active) {
      return { ok: false, error: `${item.name} sudah tidak tersedia.` };
    }
    if (p.stock < item.quantity) {
      return { ok: false, error: `Stok ${item.name} tinggal ${p.stock}.` };
    }
  }

  const subtotal = input.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const orderNumber = generateOrderNumber();
  const orderId = randomUUID();

  const { error: orderErr } = await supabase.from("orders").insert({
    id: orderId,
    order_number: orderNumber,
    customer_name: input.customerName.trim(),
    customer_phone: input.customerPhone.trim(),
    customer_address: input.customerAddress.trim(),
    notes: input.notes?.trim() || null,
    status: "pending",
    subtotal,
  });

  if (orderErr) {
    return { ok: false, error: "Gagal membuat pesanan. Coba lagi." };
  }

  const orderItems = input.items.map((i) => ({
    order_id: orderId,
    product_id: i.product_id,
    product_name: i.name,
    unit_price: i.price,
    quantity: i.quantity,
    line_total: i.price * i.quantity,
  }));

  const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
  if (itemsErr) {
    return { ok: false, error: "Gagal menyimpan detail pesanan." };
  }

  for (const item of input.items) {
    await supabase.rpc("decrement_stock", {
      p_product_id: item.product_id,
      p_qty: item.quantity,
    });
  }

  return { ok: true, orderNumber };
}
