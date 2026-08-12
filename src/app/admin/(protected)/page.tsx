import { createClient } from "@/lib/supabase/server";
import SalesBarChart from "@/components/admin/SalesBarChart";

// Jakarta = UTC+7, dipakai biar pengelompokan "hari" sesuai waktu lokal toko
const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

function toJakartaDateKey(iso: string) {
  const d = new Date(new Date(iso).getTime() + JAKARTA_OFFSET_MS);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function dayLabel(dateKey: string) {
  const d = new Date(`${dateKey}T12:00:00Z`);
  return d.toLocaleDateString("id-ID", { weekday: "short" });
}

function last7DateKeys() {
  const keys: string[] = [];
  const now = new Date(Date.now() + JAKARTA_OFFSET_MS);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: productCount },
    { count: lowStockCount },
    { count: pendingOrders },
    { data: recentOrders },
    { data: ordersLast30 },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }).lte("stock", 5),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
    supabase
      .from("orders")
      .select("id, created_at, subtotal, status")
      .neq("status", "dibatalkan")
      .gte("created_at", thirtyDaysAgo),
  ]);

  const validOrders = ordersLast30 ?? [];
  const orderIds = validOrders.map((o) => o.id);

  const { data: itemsLast30 } =
    orderIds.length > 0
      ? await supabase
          .from("order_items")
          .select("product_name, quantity, order_id")
          .in("order_id", orderIds)
      : { data: [] as { product_name: string; quantity: number; order_id: string }[] };

  // ---- Omzet ----
  const todayKey = toJakartaDateKey(new Date().toISOString());
  const omzetHariIni = validOrders
    .filter((o) => toJakartaDateKey(o.created_at) === todayKey)
    .reduce((s, o) => s + Number(o.subtotal), 0);

  const dateKeys7 = last7DateKeys();
  const chartData = dateKeys7.map((key) => ({
    label: dayLabel(key),
    value: validOrders
      .filter((o) => toJakartaDateKey(o.created_at) === key)
      .reduce((s, o) => s + Number(o.subtotal), 0),
  }));

  const omzet7Hari = chartData.reduce((s, d) => s + d.value, 0);
  const omzet30Hari = validOrders.reduce((s, o) => s + Number(o.subtotal), 0);

  // ---- Produk terlaris ----
  const qtyByProduct = new Map<string, number>();
  for (const item of itemsLast30 ?? []) {
    qtyByProduct.set(item.product_name, (qtyByProduct.get(item.product_name) ?? 0) + item.quantity);
  }
  const topProducts = Array.from(qtyByProduct.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxQty = topProducts[0]?.[1] ?? 1;

  const cards = [
    { label: "Omzet Hari Ini", value: `Rp${omzetHariIni.toLocaleString("id-ID")}` },
    { label: "Omzet 30 Hari", value: `Rp${omzet30Hari.toLocaleString("id-ID")}` },
    { label: "Total Produk", value: productCount ?? 0 },
    { label: "Stok Menipis (≤5)", value: lowStockCount ?? 0 },
    { label: "Pesanan Menunggu", value: pendingOrders ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-5">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-white border p-4" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs mb-1" style={{ color: "var(--ink-muted)" }}>{c.label}</p>
            <p className="text-lg sm:text-2xl font-bold font-display">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl bg-white border p-4" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Omzet 7 Hari Terakhir</h2>
            <span className="text-xs font-bold" style={{ color: "var(--primary)" }}>
              Rp{omzet7Hari.toLocaleString("id-ID")}
            </span>
          </div>
          <SalesBarChart data={chartData} />
        </div>

        <div className="rounded-2xl bg-white border p-4" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-semibold text-sm mb-4">Produk Terlaris (30 Hari)</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--ink-muted)" }}>Belum ada penjualan.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {topProducts.map(([name, qty], idx) => (
                <div key={name} className="flex items-center gap-3">
                  <span
                    className="text-xs font-bold w-4 shrink-0"
                    style={{ color: idx === 0 ? "var(--accent-dark)" : "var(--ink-muted)" }}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium line-clamp-1 mb-1">{name}</p>
                    <div className="h-1.5 rounded-full" style={{ background: "var(--sage)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(qty / maxQty) * 100}%`,
                          background: "var(--primary)",
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-bold shrink-0">{qty}x</span>
                </div>
              ))}
            </div>
          )}
        </div>
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
