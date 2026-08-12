import { createClient } from "@/lib/supabase/server";
import type { Order, OrderItem } from "@/lib/types";
import OrderStatusSelect from "./OrderStatusSelect";

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: items } = await supabase.from("order_items").select("*");

  const list = (orders ?? []) as Order[];
  const allItems = (items ?? []) as OrderItem[];

  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-5">Pesanan</h1>
      {list.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--ink-muted)" }}>Belum ada pesanan.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((order) => {
            const orderItems = allItems.filter((i) => i.order_id === order.id);
            return (
              <div key={order.id} className="rounded-2xl bg-white border p-4" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-mono text-xs font-semibold">{order.order_number}</p>
                    <p className="text-sm font-medium mt-0.5">{order.customer_name}</p>
                    <p className="text-xs" style={{ color: "var(--ink-muted)" }}>{order.customer_phone}</p>
                  </div>
                  <OrderStatusSelect
                    orderId={order.id}
                    status={order.status}
                    statusUpdatedAt={order.status_updated_at}
                  />
                </div>
                <p className="text-xs mb-2" style={{ color: "var(--ink-muted)" }}>{order.customer_address}</p>
                {order.notes && (
                  <p className="text-xs mb-2 italic" style={{ color: "var(--ink-muted)" }}>Catatan: {order.notes}</p>
                )}
                <div className="border-t pt-2 flex flex-col gap-1" style={{ borderColor: "var(--border)" }}>
                  {orderItems.map((i) => (
                    <div key={i.id} className="flex justify-between text-xs">
                      <span>{i.product_name} x{i.quantity}</span>
                      <span>Rp{Number(i.line_total).toLocaleString("id-ID")}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-2 pt-2 flex justify-between text-sm font-bold" style={{ borderColor: "var(--border)" }}>
                  <span>Total</span>
                  <span>Rp{Number(order.subtotal).toLocaleString("id-ID")}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
