import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [{ count: productCount }, { count: lowStockCount }, { count: pendingOrders }, { data: recentOrders }] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }).lte("stock", 5),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
    ]);

  const cards = [
    { label: "Total Produk", value: productCount ?? 0 },
    { label: "Stok Menipis (≤5)", value: lowStockCount ?? 0 },
    { label: "Pesanan Menunggu", value: pendingOrders ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-5">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-white border p-4" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs mb-1" style={{ color: "var(--ink-muted)" }}>{c.label}</p>
            <p className="text-2xl font-bold font-display">{c.value}</p>
          </div>
        ))}
      </div>

      <h2 className="font-semibold text-sm mb-3">Pesanan Terbaru</h2>
      <div className="rounded-2xl bg-white border divide-y" style={{ borderColor: "var(--border)" }}>
        {(recentOrders ?? []).length === 0 && (
          <p className="p-4 text-sm" style={{ color: "var(--ink-muted)" }}>Belum ada pesanan.</p>
        )}
        {(recentOrders ?? []).map((o) => (
          <div key={o.id} className="p-4 flex items-center justify-between text-sm">
            <div>
              <p className="font-mono font-semibold text-xs">{o.order_number}</p>
              <p style={{ color: "var(--ink-muted)" }}>{o.customer_name}</p>
            </div>
            <p className="font-bold">Rp{Number(o.subtotal).toLocaleString("id-ID")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
