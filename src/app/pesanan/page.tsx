"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getOrdersByPhone } from "@/app/actions/track-order";
import type { Order, OrderItem } from "@/lib/types";

function formatRp(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}

const STATUS_LABEL: Record<Order["status"], string> = {
  pending: "Menunggu Konfirmasi",
  diproses: "Diproses",
  dikirim: "Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

const STATUS_COLOR: Record<Order["status"], string> = {
  pending: "#F2A73B",
  diproses: "#2F6B4F",
  dikirim: "#2F6B4F",
  selesai: "#6B7266",
  dibatalkan: "#D64545",
};

type OrderWithItems = Order & { items: OrderItem[] };

export default function TrackOrderPage() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<OrderWithItems[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await getOrdersByPhone(phone);
    setOrders(result as OrderWithItems[]);
    setLoading(false);
  }

  return (
    <div className="pb-20 min-h-screen">
      <header
        className="sticky top-0 z-30 px-4 py-4 flex items-center gap-3"
        style={{ background: "var(--primary)" }}
      >
        <Link href="/" className="text-white">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-white font-display font-bold text-base">Lacak Pesanan</h1>
      </header>

      <form onSubmit={handleSearch} className="p-4 flex gap-2">
        <input
          required
          placeholder="Masukkan no. HP saat checkout"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="flex-1 rounded-xl border px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: "var(--border)" }}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl px-4 text-white text-sm font-semibold disabled:opacity-50"
          style={{ background: "var(--primary)" }}
        >
          {loading ? "..." : "Cari"}
        </button>
      </form>

      <div className="px-4 flex flex-col gap-3">
        {orders !== null && orders.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: "var(--ink-muted)" }}>
            Tidak ada pesanan ditemukan untuk nomor ini.
          </p>
        )}
        {orders?.map((order) => (
          <div key={order.id} className="rounded-2xl bg-white border p-3" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold">{order.order_number}</span>
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-white"
                style={{ background: STATUS_COLOR[order.status] }}
              >
                {STATUS_LABEL[order.status]}
              </span>
            </div>
            <div className="flex flex-col gap-1 mb-2">
              {order.items.map((i) => (
                <div key={i.id} className="flex justify-between text-xs">
                  <span className="line-clamp-1 pr-2" style={{ color: "var(--ink-muted)" }}>
                    {i.product_name} x{i.quantity}
                  </span>
                  <span className="shrink-0">{formatRp(i.line_total)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-2 flex justify-between text-sm font-bold" style={{ borderColor: "var(--border)" }}>
              <span>Total</span>
              <span>{formatRp(order.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
